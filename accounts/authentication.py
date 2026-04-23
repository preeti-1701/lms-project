from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from accounts.models import UserSession

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

        # Check if user has an active session
        jti = validated_token.get('jti')
        # In a real app we might check if this exact access token or its parent refresh token is active.
        # But per requirements: "CustomJWTAuthentication class that extends JWTAuthentication and also checks UserSession.is_active=True before accepting the token"
        session_exists = UserSession.objects.filter(user=user, is_active=True).exists()
        if not session_exists:
            raise AuthenticationFailed('Invalid credentials or session has been terminated.', code='session_terminated')

        return user, validated_token
