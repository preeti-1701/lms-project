from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, UserSession
from .serializers import UserSerializer, UserCreateUpdateSerializer
from .permissions import IsAdmin

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = CustomUser.objects.filter(email=email).first()
        if user and user.check_password(password):
            if not user.is_active:
                return Response({'detail': 'Account disabled'}, status=status.HTTP_403_FORBIDDEN)
            
            # Invalidate previous sessions
            UserSession.objects.filter(user=user, is_active=True).update(is_active=False)

            refresh = RefreshToken.for_user(user)
            
            # Create new session
            UserSession.objects.create(
                user=user,
                refresh_token_jti=refresh['jti'],
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        UserSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
        return Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer

    @action(detail=True, methods=['post'])
    def force_logout(self, request, pk=None):
        user = self.get_object()
        UserSession.objects.filter(user=user, is_active=True).update(is_active=False)
        return Response({'detail': 'User forcefully logged out'})
