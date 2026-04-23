from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Enrollment, LessonProgress
from .serializers import EnrollmentSerializer, LessonProgressSerializer
from courses.models import Course, Lesson


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


# ── Enrollment ────────────────────────────────────────────
class EnrollView(APIView):
    """Student enrolls in a course"""
    permission_classes = (IsStudent,)

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, is_published=True)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
        )
        if not created:
            return Response({'error': 'Already enrolled in this course'}, status=400)

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=201)


class UnenrollView(APIView):
    """Student unenrolls from a course"""
    permission_classes = (IsStudent,)

    def delete(self, request, course_id):
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course_id=course_id
            )
            enrollment.delete()
            return Response({'message': 'Unenrolled successfully'})
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found'}, status=404)


class MyEnrollmentsView(generics.ListAPIView):
    """Student sees all their enrolled courses"""
    serializer_class = EnrollmentSerializer
    permission_classes = (IsStudent,)

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)


class CourseStudentsView(generics.ListAPIView):
    """Instructor sees all students enrolled in their course"""
    serializer_class = EnrollmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = Course.objects.get(id=course_id)
        if self.request.user.role not in ('instructor', 'admin'):
            raise PermissionDenied('Only instructors can view enrolled students.')
        if self.request.user.role == 'instructor' and course.instructor != self.request.user:
            raise PermissionDenied('You can only view students in your own courses.')
        return Enrollment.objects.filter(course_id=course_id)


# ── Lesson Progress ───────────────────────────────────────
class LessonProgressView(APIView):
    """Student updates their progress on a lesson"""
    permission_classes = (IsStudent,)

    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            enrollment = Enrollment.objects.get(
                student=request.user,
                course=lesson.course
            )
        except Lesson.DoesNotExist:
            return Response({'error': 'Lesson not found'}, status=404)
        except Enrollment.DoesNotExist:
            return Response({'error': 'You are not enrolled in this course'}, status=403)

        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson
        )

        # update watch time and completion
        progress.watch_time_seconds = request.data.get('watch_time_seconds', progress.watch_time_seconds)
        progress.is_completed = request.data.get('is_completed', progress.is_completed)

        if progress.is_completed and not progress.completed_at:
            progress.completed_at = timezone.now()

        progress.save()

        # check if all lessons completed → mark enrollment as completed
        total_lessons = lesson.course.lessons.count()
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()

        if total_lessons == completed_lessons:
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
            enrollment.save()

        serializer = LessonProgressSerializer(progress)
        return Response(serializer.data)


class MyProgressView(generics.ListAPIView):
    """Student sees their progress in a specific course"""
    serializer_class = LessonProgressSerializer
    permission_classes = (IsStudent,)

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        enrollment = Enrollment.objects.get(
            student=self.request.user,
            course_id=course_id
        )
        return LessonProgress.objects.filter(enrollment=enrollment)