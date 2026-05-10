from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import hashlib
from audit.utils import log_event

from .models import CustomUser, UserSession
from .serializers import CustomUserSerializer, LoginSerializer
from .permissions import IsAdmin


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Your account has been disabled'},
                status=status.HTTP_403_FORBIDDEN
            )

        UserSession.objects.filter(user=user).delete()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        UserSession.objects.create(
            user=user,
            jwt_hash=hashlib.sha256(access_token.encode()).hexdigest(),
            ip_address=get_client_ip(request),
            device_info=request.META.get('HTTP_USER_AGENT', '')[:255]
        )

        log_event(user, 'LOGIN', request)

        return Response({
            'access': access_token,
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
            }
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            UserSession.objects.filter(jwt_hash=token_hash).delete()

        log_event(request.user, 'LOGOUT', request)

        return Response({'message': 'Logged out successfully'})


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        return CustomUser.objects.all().order_by('created_at')

    def perform_create(self, serializer):
        user = serializer.save()
        log_event(
            self.request.user,
            'USER_CREATED',
            self.request,
            metadata={'created_user_email': user.email, 'role': user.role}
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = CustomUserSerializer
    queryset = CustomUser.objects.all()

    def perform_update(self, serializer):
        user = serializer.save()
        if not user.is_active:
            log_event(
                self.request.user,
                'USER_DISABLED',
                self.request,
                metadata={'disabled_user_email': user.email}
            )


class ForceLogoutView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            target_user = CustomUser.objects.get(id=user_id)
            UserSession.objects.filter(user=target_user).delete()
            log_event(
                request.user,
                'LOGOUT',
                request,
                metadata={'force_logout_user': target_user.email}
            )
            return Response({'message': f'{target_user.email} has been logged out'})
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )