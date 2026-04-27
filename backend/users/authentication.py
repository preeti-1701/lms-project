from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import UserSession


class SingleSessionJWTAuthentication(JWTAuthentication):
    """JWT auth that enforces a single active access token per user."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, validated_token = result
        token_jti = str(validated_token.get('jti', ''))

        try:
            session = UserSession.objects.get(user=user)
        except UserSession.DoesNotExist:
            raise exceptions.AuthenticationFailed(
                'Session expired. Please login again.',
                code='session_expired',
            )

        if not session.current_access_jti or session.current_access_jti != token_jti:
            raise exceptions.AuthenticationFailed(
                'Session expired. Please login again.',
                code='session_expired',
            )

        return (user, validated_token)
