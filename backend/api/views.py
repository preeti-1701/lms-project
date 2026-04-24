from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User, UserSession, AuditLog, Notification, Ticket
from courses.models import Course, CourseVideo, CourseMaterial
from .serializers import (
    UserSerializer, UserCreateSerializer, UserSessionSerializer,
    CourseSerializer, CourseVideoSerializer, NotificationSerializer,
    TicketSerializer, CourseMaterialSerializer
)

class AuditLogMixin:
    def _get_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return self.request.META.get('REMOTE_ADDR')

    def log_action(self, action_str, target_str):
        if self.request.user and self.request.user.is_authenticated:
            AuditLog.objects.create(
                actor=self.request.user,
                action=action_str,
                target=target_str,
                ip_address=self._get_ip()
            )

    def perform_create(self, serializer):
        super().perform_create(serializer)
        self.log_action(f"Created {serializer.instance.__class__.__name__}", str(serializer.instance))

    def perform_update(self, serializer):
        super().perform_update(serializer)
        self.log_action(f"Updated {serializer.instance.__class__.__name__}", str(serializer.instance))

    def perform_destroy(self, instance):
        target_str = str(instance)
        model_name = instance.__class__.__name__
        super().perform_destroy(instance)
        self.log_action(f"Deleted (Hard) {model_name}", target_str)

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPERADMIN')

class IsAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPERADMIN'])

class IsTrainerOrAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPERADMIN', 'TRAINER'])

class CanManageUsers(permissions.BasePermission):
    def has_permission(self, request, view):
        # Only SUPERADMIN can delete another admin.
        # But for generic view access, Admin or SuperAdmin is ok.
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPERADMIN'])

class CanManageCourses(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPERADMIN', 'TRAINER'])

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"detail": "User created successfully", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        if user is None:
            # Maybe phone number?
            try:
                user_by_phone = User.objects.get(phone_number=email)
                user = authenticate(username=user_by_phone.email, password=password)
            except User.DoesNotExist:
                user = None

        if user:
            # Invalidate older sessions
            UserSession.objects.filter(user=user, is_active=True).update(is_active=False)
            
            refresh = RefreshToken.for_user(user)
            token_str = str(refresh.access_token)
            
            # Create new session
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            
            UserSession.objects.create(
                user=user,
                session_token=token_str,
                ip_address=ip,
                device_info=request.META.get('HTTP_USER_AGENT', ''),
                is_active=True
            )
            
            return Response({
                'refresh': str(refresh),
                'access': token_str,
                'user': UserSerializer(user).data
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [CanManageUsers]
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return UserCreateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.status = 'INACTIVE'
        user.is_active = False
        user.save()
        return Response({"detail": "User deactivated successfully."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.status = 'INACTIVE'
        user.is_active = False
        user.save()
        if hasattr(self, 'log_action'):
            self.log_action("Deactivated User", str(user))
        return Response({"detail": "User deactivated successfully."}, status=status.HTTP_200_OK)

class SessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserSession.objects.all().order_by('-created_at')
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = UserSessionSerializer

    @action(detail=True, methods=['post'])
    def force_logout(self, request, pk=None):
        session = self.get_object()
        session.is_active = False
        session.save()
        return Response({"detail": "Session invalidated"}, status=status.HTTP_200_OK)

class CourseViewSet(AuditLogMixin, viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'TRAINER']:
            return Course.objects.all()
        # Student, only assigned courses
        return Course.objects.filter(assigned_users=user)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageCourses()]
        return [permissions.IsAuthenticated()]

class CourseVideoViewSet(viewsets.ModelViewSet):
    serializer_class = CourseVideoSerializer

    def get_queryset(self):
        return CourseVideo.objects.filter(course_id=self.kwargs['course_pk'])

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageCourses()]
        # Allow authenticated students to read, but they should only read assigned courses videos
        # Ideally would check if user is assigned to course
        return [permissions.IsAuthenticated()]
        
    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs['course_pk'])
        serializer.save(course=course)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "read"})

class TicketViewSet(AuditLogMixin, viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['ADMIN', 'SUPERADMIN']:
            return Ticket.objects.all().order_by('-created_at')
        return Ticket.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        super().perform_create(serializer)
        serializer.instance.user = self.request.user
        serializer.instance.save()

class CourseMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = CourseMaterialSerializer

    def get_queryset(self):
        return CourseMaterial.objects.filter(course_id=self.kwargs['course_pk'])

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageCourses()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs['course_pk'])
        serializer.save(course=course)
