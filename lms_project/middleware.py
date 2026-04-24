from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from accounts.models import UserSession


class ActiveSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        jwt_auth = JWTAuthentication()

        try:
            header = jwt_auth.get_header(request)
            if header is not None:
                raw_token = jwt_auth.get_raw_token(header)
                validated_token = jwt_auth.get_validated_token(raw_token)

                user = jwt_auth.get_user(validated_token)

                # Check active session
                if not UserSession.objects.filter(
                    user=user,
                    token=str(raw_token),
                    is_active=True
                ).exists():
                    raise AuthenticationFailed("Session expired or invalid")

        except Exception:
            pass

        return self.get_response(request)