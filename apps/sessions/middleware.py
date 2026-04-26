"""
LMS Middleware
1. SessionTrackingMiddleware  — updates last_activity on every request
2. SingleSessionEnforcementMiddleware — blocks requests if session was invalidated
"""
import logging
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

logger = logging.getLogger('apps.sessions')


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


class SessionTrackingMiddleware(MiddlewareMixin):
    """
    Update the UserSession.last_activity timestamp on every authenticated request.
    This powers the admin's "last seen" display.
    """
    # Only update every 60 seconds to avoid DB hammering
    UPDATE_INTERVAL_SECONDS = 60

    def process_request(self, request):
        # Run after auth middleware — request.user is set
        pass

    def process_response(self, request, response):
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response

        # Throttle DB updates
        cache_key = f"session_activity_{request.user.id}"
        try:
            from django.core.cache import cache
            if not cache.get(cache_key):
                from apps.sessions.models import UserSession
                UserSession.objects.filter(
                    user=request.user, is_active=True
                ).update(last_activity=timezone.now())
                cache.set(cache_key, True, self.UPDATE_INTERVAL_SECONDS)
        except Exception:
            pass  # Never break the request flow

        return response


class SingleSessionEnforcementMiddleware(MiddlewareMixin):
    """
    Validates the JWT bearer token against active sessions.
    If admin has force-logged-out a user, their token is rejected
    even if it hasn't expired yet.

    This adds an extra security layer beyond standard JWT blacklisting.
    """
    # Paths exempt from session validation
    EXEMPT_PATHS = [
        '/api/v1/auth/login/',
        '/api/v1/auth/token/refresh/',
        '/admin/',
        '/api/schema/',
        '/api/docs/',
        '/api/redoc/',
        '/static/',
        '/media/',
    ]

    def process_request(self, request):
        # Skip non-API paths and exempt paths
        if not request.path.startswith('/api/'):
            return None
        if any(request.path.startswith(p) for p in self.EXEMPT_PATHS):
            return None

        # Only check authenticated requests with Bearer token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        # After JWT auth runs, validate session is still active
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                from apps.sessions.models import UserSession
                has_active_session = UserSession.objects.filter(
                    user=request.user, is_active=True
                ).exists()

                if not has_active_session:
                    logger.warning(
                        f"Session enforcement: rejected request from {request.user.email} "
                        f"— no active session found (possibly force-logged-out)"
                    )
                    return JsonResponse(
                        {
                            'success': False,
                            'error': {
                                'code': 'SESSION_EXPIRED',
                                'message': (
                                    'Your session has been terminated. '
                                    'Please log in again.'
                                ),
                            }
                        },
                        status=401
                    )
            except Exception as e:
                logger.error(f"Session enforcement error: {e}")
                # Fail open — don't block if session check fails

        return None
