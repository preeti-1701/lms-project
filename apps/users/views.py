"""
User Views for LMS API
"""
import logging
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserListSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    AdminResetPasswordSerializer,
)
from .permissions import IsAdmin, IsOwnerOrAdmin
from apps.sessions.models import UserSession

User = get_user_model()
logger = logging.getLogger('apps.users')


class LoginThrottle(AnonRateThrottle):
    rate = '10/hour'
    scope = 'login'


# ─────────────────────────────────────────────────────────────
# AUTHENTICATION VIEWS
# ─────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    Login with email/mobile + password.
    Returns JWT access + refresh tokens.
    Single session enforced: previous sessions are invalidated.
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Record session
            identifier = request.data.get('email', '')
            try:
                if '@' in identifier:
                    user = User.objects.get(email__iexact=identifier)
                else:
                    user = User.objects.get(mobile=identifier)

                # Invalidate all previous active sessions (single session enforcement)
                UserSession.objects.filter(
                    user=user, is_active=True
                ).update(is_active=False, logged_out_at=timezone.now())

                # Create new session record
                session = UserSession.objects.create(
                    user=user,
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    device_type=_get_device_type(request),
                    access_token=response.data['access'][:50],  # Store partial token
                )
                logger.info(f"User {user.email} logged in from {session.ip_address}")

            except User.DoesNotExist:
                pass

        return response


class LogoutView(generics.GenericAPIView):
    """
    POST /api/v1/auth/logout/
    Blacklists refresh token and marks session as inactive.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Mark session inactive
            UserSession.objects.filter(
                user=request.user, is_active=True
            ).update(is_active=False, logged_out_at=timezone.now())

            logger.info(f"User {request.user.email} logged out.")
            return Response({'detail': 'Successfully logged out.'})

        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshWithValidationView(TokenRefreshView):
    """
    POST /api/v1/auth/token/refresh/
    Standard refresh — validates session is still active.
    """
    pass


# ─────────────────────────────────────────────────────────────
# USER MANAGEMENT VIEWS
# ─────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    /api/v1/users/
    Admin: full CRUD on all users.
    Students/Trainers: view own profile.
    """
    queryset = User.objects.all().order_by('-date_joined')
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name', 'mobile']

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        return UserDetailSerializer

    def get_permissions(self):
        if self.action in ('list', 'create', 'destroy'):
            return [IsAdmin()]
        if self.action in ('update', 'partial_update'):
            return [IsAdmin()]
        return [IsOwnerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_superuser:
            return User.objects.all()
        return User.objects.filter(pk=user.pk)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """GET /api/v1/users/me/ — Current user profile."""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """PATCH /api/v1/users/update_profile/ — Update own profile."""
        serializer = UserUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserDetailSerializer(request.user).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """POST /api/v1/users/change_password/"""
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin()])
    def reset_password(self, request, pk=None):
        """POST /api/v1/users/{id}/reset_password/ — Admin resets user password."""
        user = self.get_object()
        serializer = AdminResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': f"Password reset for {user.email}."})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin()])
    def toggle_active(self, request, pk=None):
        """POST /api/v1/users/{id}/toggle_active/ — Enable/disable account."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        status_str = 'activated' if user.is_active else 'deactivated'

        if not user.is_active:
            # Force logout by invalidating sessions
            UserSession.objects.filter(
                user=user, is_active=True
            ).update(is_active=False, logged_out_at=timezone.now())

        return Response({
            'detail': f"Account {status_str} for {user.email}.",
            'is_active': user.is_active
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin()])
    def force_logout(self, request, pk=None):
        """POST /api/v1/users/{id}/force_logout/ — Admin forces user logout."""
        user = self.get_object()
        count = UserSession.objects.filter(user=user, is_active=True).update(
            is_active=False, logged_out_at=timezone.now()
        )
        logger.warning(f"Admin {request.user.email} force-logged-out {user.email}")
        return Response({
            'detail': f"Force-logged out {user.email}. Sessions terminated: {count}."
        })


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def _get_device_type(request):
    ua_string = request.META.get('HTTP_USER_AGENT', '').lower()
    if 'mobile' in ua_string or 'android' in ua_string or 'iphone' in ua_string:
        return 'mobile'
    if 'tablet' in ua_string or 'ipad' in ua_string:
        return 'tablet'
    return 'desktop'
