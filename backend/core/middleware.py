from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


class SingleSessionMiddleware(MiddlewareMixin):
    """Validates session token to ensure single active session per user"""
    
    def process_request(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                access_token = AccessToken(token)
                user_id = access_token.payload.get('user_id')
                session_token = access_token.payload.get('session_token')
                
                user = User.objects.filter(id=user_id).first()
                if user and user.session_token and user.session_token != session_token:
                    from django.http import JsonResponse
                    return JsonResponse(
                        {'error': 'Session expired. You have logged in from another device.'},
                        status=401
                    )
            except Exception:
                pass
        return None
