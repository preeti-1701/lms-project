from datetime import timedelta

from django.utils import timezone
from rest_framework.response import Response

from accounts.models import UserSession

SESSION_TIMEOUT = timedelta(minutes=30)


def _check_session(request, touch=False):
    session_token = request.headers.get('Session-Token')

    if not session_token:
        return None, 'Session missing', 401

    if not request.user or not request.user.is_authenticated:
        return None, 'Unauthorized', 401

    session = UserSession.objects.filter(
        user=request.user,
        session_token=session_token,
        is_active=True
    ).first()

    if not session:
        return None, 'Session inactive', 401

    now = timezone.now()
    if session.last_activity and now - session.last_activity > SESSION_TIMEOUT:
        session.is_active = False
        session.save(update_fields=['is_active'])
        return None, 'Session expired', 401

    if touch:
        session.last_activity = now
        session.save(update_fields=['last_activity'])

    return session, None, None


def validate_session(request):
    _, error_message, status_code = _check_session(request, touch=False)

    if error_message:
        return Response({'error': error_message}, status=status_code)

    return None