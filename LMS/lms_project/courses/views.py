from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Course,
    Video,
    Enrollment,
    Progress,
    CourseAssignment
)

from .serializers import (
    CourseSerializer,
    VideoSerializer,
    EnrollmentSerializer,
    ProgressSerializer,
    CourseAssignmentSerializer
)


# =========================
# COURSE VIEW
# =========================

class CourseViewSet(viewsets.ModelViewSet):

    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # ================= ADMIN =================

        if user.is_superuser or user.role == 'admin':

            return Course.objects.all()

        # ================= TRAINER =================

        elif user.role == 'trainer':

            return Course.objects.filter(
                trainers=user
            ).distinct()

        # ================= STUDENT =================

        elif user.role == 'student':

            return Course.objects.filter(
                enrollment__student=user
            ).distinct()

        return Course.objects.none()

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


# =========================
# VIDEO VIEW
# =========================

class VideoViewSet(viewsets.ModelViewSet):

    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # ADMIN

        if user.is_superuser or user.role == 'admin':

            return Video.objects.all()

        # TRAINER

        elif user.role == 'trainer':

            return Video.objects.filter(
                course__trainers=user
            ).distinct()

        # STUDENT

        elif user.role == 'student':

            return Video.objects.filter(
                course__enrollment__student=user
            ).distinct()

        return Video.objects.none()


# =========================
# ENROLLMENT VIEW
# =========================

class EnrollmentViewSet(viewsets.ModelViewSet):

    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]


# =========================
# PROGRESS VIEW
# =========================

class ProgressViewSet(viewsets.ModelViewSet):

    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Progress.objects.filter(
            student=self.request.user
        )

    def perform_create(self, serializer):

        serializer.save(
            student=self.request.user
        )


# =========================
# COURSE ASSIGNMENT VIEW
# =========================

class CourseAssignmentViewSet(viewsets.ModelViewSet):

    queryset = CourseAssignment.objects.all()

    serializer_class = CourseAssignmentSerializer

    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        assignment = serializer.save()

        user = assignment.user
        course = assignment.course

        # ================= STUDENT =================

        if user.role == 'student':

            Enrollment.objects.get_or_create(
                student=user,
                course=course
            )

        # ================= TRAINER =================

        elif user.role == 'trainer':

            course.trainers.add(user)