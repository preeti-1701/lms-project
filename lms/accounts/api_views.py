"""REST API views for authentication."""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


class RegisterAPIView(generics.CreateAPIView):
    """Public endpoint to create a new user account."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Issue tokens immediately so the client can log in right away.
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeAPIView(generics.RetrieveAPIView):
    """Return the currently-authenticated user."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutAPIView(APIView):
    """Best-effort logout: just acknowledge.

    JWTs are stateless; for a strict logout add the SimpleJWT token blacklist
    app and blacklist the refresh token here.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)
