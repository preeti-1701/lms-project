from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        # Check token version for single active session
        token_version = validated_token.get("token_version")
        if str(user.token_version) != token_version:
            raise AuthenticationFailed("Session expired or logged in from another device.", code="user_inactive")

        return user, validated_token
