from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

User = get_user_model()

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if request.path.startswith('/api/'):
            jwt_auth = JWTAuthentication()

            try:
                user_auth_tuple = jwt_auth.authenticate(request)

                if user_auth_tuple is not None:
                    user, token = user_auth_tuple

                    # 🔥 Get session token from header
                    session_token = request.headers.get('Session-Token')

                    if user.session_token != session_token:
                        return JsonResponse({'error': 'Session expired'}, status=401)

            except Exception:
                pass

        return self.get_response(request)