"""
Course, Video, and Enrollment Views
"""
import logging
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Course, Video, Enrollment, VideoProgress
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer,
    VideoSerializer, VideoListSerializer,
    EnrollmentSerializer, BulkEnrollSerializer,
    VideoProgressSerializer,
)
from apps.users.permissions import IsAdmin, IsAdminOrTrainer, CanViewCourse

User = get_user_model()
logger = logging.getLogger('apps.courses')


class CourseViewSet(viewsets.ModelViewSet):
    """
    /api/v1/courses/
    - Admin/Trainer: full CRUD
    - Student: view only enrolled courses
    """
    filterset_fields = ['status', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_superuser:
            return Course.objects.all()
        if user.is_trainer:
            return Course.objects.filter(created_by=user)
        # Students: only enrolled, published courses
        return Course.objects.filter(
            enrollments__user=user,
            enrollments__is_active=True,
            status=Course.Status.PUBLISHED
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer

    def get_permissions(self):
        if self.action in ('create',):
            return [IsAdminOrTrainer()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsAdminOrTrainer()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.save(created_by=self.request.user)
        logger.info(f"Course '{course.title}' created by {self.request.user.email}")

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def videos(self, request, pk=None):
        """GET /api/v1/courses/{id}/videos/ — List course videos."""
        course = self.get_object()

        # Students must be enrolled
        if request.user.is_student:
            enrolled = course.enrollments.filter(
                user=request.user, is_active=True
            ).exists()
            if not enrolled:
                return Response(
                    {'detail': 'You are not enrolled in this course.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        videos = course.videos.filter(is_active=True).order_by('order')
        serializer = VideoListSerializer(videos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def my_progress(self, request, pk=None):
        """GET /api/v1/courses/{id}/my_progress/ — Student progress."""
        course = self.get_object()
        enrollment = get_object_or_404(
            Enrollment, user=request.user, course=course, is_active=True
        )
        progress_records = enrollment.video_progress.select_related('video').all()
        return Response({
            'course': course.title,
            'progress_percent': enrollment.progress_percent,
            'videos': VideoProgressSerializer(progress_records, many=True).data
        })


class VideoViewSet(viewsets.ModelViewSet):
    """
    /api/v1/courses/{course_id}/videos/
    Admin/Trainer: CRUD on course videos.
    """
    serializer_class = VideoSerializer

    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return Video.objects.filter(course_id=course_id).order_by('order')

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAdminOrTrainer()]

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, id=course_id)

        # Trainers can only add to their own courses
        if self.request.user.is_trainer and course.created_by != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add videos to your own courses.")

        serializer.save(course=course)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    /api/v1/enrollments/
    Admin/Trainer: manage enrollments.
    Students: view their own.
    """
    serializer_class = EnrollmentSerializer
    filterset_fields = ['course', 'user', 'is_active']
    search_fields = ['user__email', 'course__title']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_superuser:
            return Enrollment.objects.select_related('user', 'course', 'enrolled_by').all()
        if user.is_trainer:
            return Enrollment.objects.filter(course__created_by=user)
        return Enrollment.objects.filter(user=user, is_active=True)

    def get_permissions(self):
        if self.action in ('create', 'destroy', 'update', 'partial_update'):
            return [IsAdminOrTrainer()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrTrainer()])
    def bulk_enroll(self, request):
        """
        POST /api/v1/enrollments/bulk_enroll/
        Enroll multiple students at once.
        """
        serializer = BulkEnrollSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course = Course.objects.get(id=serializer.validated_data['course_id'])
        user_ids = serializer.validated_data['user_ids']
        users = User.objects.filter(id__in=user_ids, role=User.Role.STUDENT, is_active=True)

        created, skipped = 0, 0
        for user in users:
            _, was_created = Enrollment.objects.get_or_create(
                user=user, course=course,
                defaults={'enrolled_by': request.user, 'is_active': True}
            )
            if was_created:
                created += 1
            else:
                skipped += 1

        return Response({
            'detail': f'Bulk enrollment complete.',
            'enrolled': created,
            'already_enrolled': skipped,
            'course': course.title,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrTrainer()])
    def revoke(self, request, pk=None):
        """POST /api/v1/enrollments/{id}/revoke/ — Deactivate enrollment."""
        enrollment = self.get_object()
        enrollment.is_active = False
        enrollment.save()
        return Response({'detail': 'Enrollment revoked.'})


class VideoProgressView(generics.UpdateAPIView):
    """
    PATCH /api/v1/progress/{id}/
    Students update their video watch progress.
    """
    serializer_class = VideoProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VideoProgress.objects.filter(enrollment__user=self.request.user)

    def update(self, request, *args, **kwargs):
        progress, _ = VideoProgress.objects.get_or_create(
            enrollment__user=request.user,
            video_id=request.data.get('video'),
            defaults={'watched_seconds': 0}
        )
        serializer = self.get_serializer(progress, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update overall course progress
        enrollment = progress.enrollment
        total_videos = enrollment.course.videos.filter(is_active=True).count()
        completed = enrollment.video_progress.filter(is_completed=True).count()
        if total_videos > 0:
            enrollment.progress_percent = int((completed / total_videos) * 100)
            enrollment.save(update_fields=['progress_percent'])

        return Response(serializer.data)
