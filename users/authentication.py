from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        # 1. Check if the admin disabled this user
        if not user.is_active:
            raise AuthenticationFailed("This account has been disabled.")

        # 2. Check token version to enforce "Force Logout"
        token_version = validated_token.get('token_version')
        if user.token_version != token_version:
            raise AuthenticationFailed("Session expired or you were forced to log out.")

        return user