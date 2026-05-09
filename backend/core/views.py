from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
import uuid
from django.utils import timezone
from datetime import timedelta
from .models import Video, Enrollment, SecurityNotification
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .permissions import IsStudent

from .models import Course, Video, Enrollment, VideoProgress, SecurityNotification
from .serializers import (
    UserSerializer, CourseSerializer,
    VideoSerializer, EnrollmentSerializer,
    VideoProgressSerializer, LoginSerializer,
    SecurityNotificationSerializer
)
from .permissions import IsAdmin, IsTrainerOrAdmin, IsAdminOnly

User = get_user_model()

# =========================
#  AUTH APIs
# =========================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = authenticate(request, username=email, password=password)

    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Generate unique session token for single device login
    session_token = str(uuid.uuid4())
    
    # Store session token and device info in user model
    user.session_token = session_token
    user.last_ip = request.META.get('REMOTE_ADDR')
    user.last_device = request.headers.get('User-Agent', '')[:255]  # Limit to 255 chars
    user.save(update_fields=['session_token', 'last_ip', 'last_device'])

    # Include session_token in JWT refresh token
    refresh = RefreshToken.for_user(user)
    refresh.payload['session_token'] = session_token

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh access token using refresh token
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response({'error': 'refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        token = RefreshToken(refresh_token)
        
        # Get user from token
        user_id = token.payload.get('user_id')
        session_token = token.payload.get('session_token')
        
        if not user_id:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verify user and session token still matches
        user = User.objects.get(id=user_id)
        
        if not user.is_active:
            return Response({'error': 'User account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check session token still valid (single device login)
        if user.session_token != session_token:
            return Response(
                {'error': 'Session expired. You have logged in from another device.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate new access token with same session token
        access = token.access_token
        
        return Response({
            'access': str(access),
            'user': UserSerializer(user).data
        })
        
    except Exception as e:
        return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # Clear user's session token on logout
    user = request.user
    user.session_token = None
    user.save(update_fields=['session_token'])
    
    return Response({'message': 'Logged out successfully'})


@api_view(['POST'])
@permission_classes([IsAdmin])
def force_logout_user(request):
    """
    Admin can force logout any user by invalidating their session
    """
    user_id = request.data.get('user_id')
    
    if not user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        # Generate new session token to invalidate old one
        user.session_token = str(uuid.uuid4())
        user.save(update_fields=['session_token'])
        
        return Response({
            'message': f'User {user.email} has been force logged out',
            'user_id': user.id
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_active_sessions(request):
    """
    Admin can see all active users with their IP and device info
    """
    # Get all users who have a session_token (logged in users)
    active_users = User.objects.filter(
        session_token__isnull=False
    ).select_related()
    
    sessions = []
    for user in active_users:
        sessions.append({
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'last_ip': user.last_ip,
            'last_device': user.last_device,
            'is_active': user.is_active,
        })
    
    return Response({'sessions': sessions, 'count': len(sessions)})


# =========================
#  USER MANAGEMENT (Admin Only)
# =========================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return User.objects.filter(role=role)
        return User.objects.all()

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """
        Admin can change user role
        """
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in ['admin', 'trainer', 'student']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = new_role
        user.save(update_fields=['role'])
        
        return Response({
            'message': f'User role changed to {new_role}',
            'user': UserSerializer(user).data
        })

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """
        Admin can reset user password
        """
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({'error': 'new_password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = self.get_object()
        user.set_password(new_password)
        user.save(update_fields=['password'])
        
        return Response({'message': 'Password updated successfully'})

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Admin can activate/deactivate user account
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        
        return Response({
            'message': f'User {"activated" if user.is_active else "deactivated"}',
            'is_active': user.is_active
        })


# =========================
#  COURSES
# =========================

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        # Admin only can create/update/delete courses
        if self.action in ['list', 'retrieve', 'enroll']:
            return [IsAuthenticated()]
        return [IsAdminOnly()]  # Only admin can create courses

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Course.objects.all()
        elif user.role == 'trainer':
            # Trainers can see courses assigned to them
            return Course.objects.filter(trainer=user)
        else:
            # Students can see all courses to browse for enrollment
            return Course.objects.all()

    def perform_create(self, serializer):
        # Only admin can create courses (enforced by permission)
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        if user.role != 'student':
            return Response({'error': 'Only students can enroll'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Enrollment.objects.filter(course=course, student=user).exists():
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        
        Enrollment.objects.create(course=course, student=user)
        return Response({'message': 'Enrolled successfully', 'course_id': course.id}, status=status.HTTP_201_CREATED)


# =========================
#  VIDEOS
# =========================

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Trainers can only add videos to their assigned courses
        return [IsTrainerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get('course_id')
        
        # If specific course requested
        if course_id:
            videos = Video.objects.filter(course_id=course_id).order_by('order')
            
            # For students: only show videos for enrolled courses (done at detail level)
            return videos
        
        if user.role == 'admin':
            return Video.objects.all().order_by('order')
        elif user.role == 'trainer':
            # Trainers can see videos for their assigned courses
            return Video.objects.filter(course__trainer=user).order_by('order')
        else:
            # Students: only show videos for enrolled courses
            enrolled_course_ids = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            return Video.objects.filter(
                course_id__in=enrolled_course_ids
            ).order_by('order')

    def get_object(self):
        """Override to check enrollment for students viewing specific video"""
        obj = super().get_object()
        user = self.request.user
        
        # Admin and trainer can always view
        if user.role in ['admin', 'trainer']:
            return obj
        
        # Student: check if enrolled in the video's course
        if not Enrollment.objects.filter(
            student=user, course=obj.course
        ).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must enroll to view this video")
        
        return obj

    def perform_create(self, serializer):
        course_id = self.request.data.get('course')
        
        if course_id:
            try:
                course = Course.objects.get(id=course_id)
                
                # Verify trainer owns this course
                user = self.request.user
                if user.role == 'trainer' and course.trainer != user:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("You can only add videos to your assigned courses")
                
                serializer.save(course=course)
            except Course.DoesNotExist:
                from rest_framework.exceptions import NotFound
                raise NotFound("Course not found")
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Course ID is required")


# =========================
#  ENROLLMENTS
# =========================

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role == 'trainer':
            return Enrollment.objects.filter(course__trainer=user)
        else:
            return Enrollment.objects.all()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


# =========================
# PROGRESS
# =========================

class VideoProgressViewSet(viewsets.ModelViewSet):
    queryset = VideoProgress.objects.all()
    serializer_class = VideoProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VideoProgress.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


# =========================
# DASHBOARD
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user

    if user.role == 'admin':
        return Response({
            "total_users": User.objects.count(),
            "total_students": User.objects.filter(role='student').count(),
            "total_trainers": User.objects.filter(role='trainer').count(),
            "total_courses": Course.objects.count(),
            "total_videos": Video.objects.count(),
            "total_enrollments": Enrollment.objects.count(),
        })

    elif user.role == 'trainer':
        trainer_courses = Course.objects.filter(trainer=user)
        return Response({
            "my_courses": trainer_courses.count(),
            "total_videos": Video.objects.filter(course__in=trainer_courses).count(),
            "total_enrollments": Enrollment.objects.filter(course__in=trainer_courses).count(),
        })

    else:
        enrollments = Enrollment.objects.filter(student=user)
        videos_watched = VideoProgress.objects.filter(student=user, watched=True).count()
        
        enrolled_courses = enrollments.count()
        total_videos = Video.objects.filter(
            course__in=enrollments.values('course_id')
        ).count()
        
        progress = 0
        if total_videos > 0:
            progress = int((videos_watched / total_videos) * 100)

        return Response({
            "enrolled_courses": enrolled_courses,
            "total_videos": total_videos,
            "videos_watched": videos_watched,
            "progress_percentage": progress
        })


# =========================
# SECURITY NOTIFICATIONS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def report_security_event(request):
    """
    Student reports security event (screenshot, recording attempt, etc.)
    """
    notification_type = request.data.get('notification_type')
    course_id = request.data.get('course_id')
    video_id = request.data.get('video_id')
    description = request.data.get('description', '')
    
    if not notification_type:
        return Response({'error': 'notification_type is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    valid_types = ['screenshot', 'screen_record', 'print', 'watermark', 'right_click', 'download']
    if notification_type not in valid_types:
        return Response({'error': 'Invalid notification type'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        notification = SecurityNotification.objects.create(
            student=request.user,
            notification_type=notification_type,
            course_id=course_id,
            video_id=video_id,
            description=description,
            user_agent=request.headers.get('User-Agent', ''),
            ip_address=request.META.get('REMOTE_ADDR')
        )

        response_data = {
            'message': 'Security event reported',
            'id': notification.id
        }

        # Auto-logout for critical violations
        critical_types = ['screenshot', 'screen_record', 'print']
        if notification_type in critical_types:
            request.user.session_token = str(uuid.uuid4())
            request.user.save(update_fields=['session_token'])
            response_data['force_logout'] = True
            response_data['reason'] = f'Critical violation: {notification_type}'

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_security_notifications(request):
    """
    Admin/Trainer gets security notifications for their courses
    """
    user = request.user
    
    if user.role == 'student':
        # Students can only see their own notifications
        notifications = SecurityNotification.objects.filter(student=user)
    elif user.role == 'trainer':
        # Trainers see notifications for courses they teach
        notifications = SecurityNotification.objects.filter(
            course__trainer=user
        ).order_by('-created_at')[:50]
    else:
        # Admin sees all
        notifications = SecurityNotification.objects.all().order_by('-created_at')[:50]
    
    serializer = SecurityNotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_notifications(request):
    """
    Get unread notification count for dashboard
    """
    user = request.user
    
    if user.role == 'admin':
        unread = SecurityNotification.objects.filter(is_read=False).count()
    elif user.role == 'trainer':
        unread = SecurityNotification.objects.filter(
            course__trainer=user, is_read=False
        ).count()
    else:
        unread = SecurityNotification.objects.filter(
            student=user, is_read=False
        ).count()
    
    return Response({'unread_count': unread})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def secure_video_token(request):
    """
    Generate short-lived token for secure video access
    """
    video_id = request.data.get('video_id')
    if not video_id:
        return Response({'error': 'video_id required'}, status=400)
    
    try:
        video = Video.objects.get(id=video_id)
        # Check enrollment
        if not Enrollment.objects.filter(student=request.user, course=video.course).exists():
            return Response({'error': 'Not enrolled'}, status=403)
        
        import secrets
        token = secrets.token_urlsafe(32)
        expiry = timezone.now() + timedelta(minutes=30)  # 30 min expiry
        
        # Store in session or Redis (simple: use user session_token + video_id check)
        request.user.video_token = f"{token}:{video_id}"
        request.user.video_token_expiry = expiry
        request.user.save()
        
        return Response({
            'token': token,
            'video_url': video.youtube_url,
            'embed_url': video.youtube_embed_url,
            'title': video.title,
            'course_id': video.course.id,
            'expires_at': expiry.isoformat()
        })
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def report_security_violation(request):
    """
    Enhanced security report with auto-force-logout on critical violations
    """
    data = request.data.copy()
    notification_type = data.pop('notification_type')
    critical_types = ['screenshot', 'screen_record', 'print']
    
    # Create notification
    try:
        notification_kwargs = {}
        for k, v in data.items():
            if k == 'course_id':
                notification_kwargs['course_id'] = v
            elif k == 'video_id':
                notification_kwargs['video_id'] = v
            elif k == 'description':
                notification_kwargs['description'] = v

        notification = SecurityNotification.objects.create(
            student=request.user,
            notification_type=notification_type,
            **notification_kwargs
        )

    except Exception:
        return Response({'error': 'Failed to create notification'}, status=400)
    
    response_data = {
        'message': 'Violation reported',
        'notification_id': notification.id
    }
    
    # Critical violation → force logout
    if notification_type in critical_types:
        # Invalidate session token
        request.user.session_token = str(uuid.uuid4())
        request.user.save()
        response_data['force_logout'] = True
        response_data['reason'] = f'Critical violation: {notification_type}'
    
    return Response(response_data)
