"""REST API views for courses, lessons and enrollments."""
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrReadOnly

from .models import Course, Enrollment, Lesson, LessonProgress
from .serializers import (
    CourseSerializer, EnrollmentSerializer, LessonSerializer,
)


class CourseListCreateAPIView(generics.ListCreateAPIView):
    """List all courses (any authenticated user) or create one (admin only)."""
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class CourseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve / update / delete a single course."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]


class EnrollAPIView(APIView):
    """POST to enroll the current user in a course."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            enrollment = Enrollment.objects.create(student=request.user, course=course)
        except IntegrityError:
            return Response(
                {'detail': 'You are already enrolled in this course.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)


class MyEnrollmentsAPIView(generics.ListAPIView):
    """List enrollments for the current user (with progress data)."""
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Enrollment.objects
            .filter(student=self.request.user)
            .select_related('course')
            .order_by('-enrolled_at')
        )


# -------- Lessons --------

class LessonListCreateAPIView(generics.ListCreateAPIView):
    """List or create lessons under a given course id."""
    serializer_class = LessonSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return Lesson.objects.filter(course_id=self.kwargs['course_id']).order_by('order', 'id')

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs['course_id'])
        serializer.save(course=course)


class LessonDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve / update / delete a single lesson."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAdminOrReadOnly]


class LessonCompleteAPIView(APIView):
    """Mark a lesson as complete (or incomplete) for the current user.

    Body: `{"completed": true|false}` (defaults to true).
    The student must be enrolled in the lesson's course.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)

        # Must be enrolled to track progress
        if not Enrollment.objects.filter(student=request.user, course=lesson.course).exists():
            return Response(
                {'detail': 'You must be enrolled in the course to track progress.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        completed = bool(request.data.get('completed', True))
        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user, lesson=lesson,
        )
        progress.completed = completed
        progress.completed_at = timezone.now() if completed else None
        progress.save()

        # Recompute course-level progress for the response
        enrollment = Enrollment.objects.get(student=request.user, course=lesson.course)
        return Response({
            'lesson_id': lesson.id,
            'completed': progress.completed,
            'progress_percentage': enrollment.progress_percentage,
            'completed_lessons': enrollment.completed_lessons,
            'total_lessons': enrollment.total_lessons,
        }, status=status.HTTP_200_OK)
