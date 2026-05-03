from rest_framework import viewsets, permissions, serializers
from .models import Enrollment
from .serializers import EnrollmentSerializer
from courses.permissions import IsAdmin, IsStudent


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsAdmin | IsStudent]
        elif self.action in ['destroy']:
            permission_classes = [IsAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Enrollment.objects.all()
        elif user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role == 'trainer':
            return Enrollment.objects.filter(course__trainer=user)
        return Enrollment.objects.none()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if user.role == 'student' and obj.student != user:
            self.permission_denied(
                self.request,
                message="You can only access your own enrollments."
            )
        if user.role == 'trainer' and obj.course.trainer != user:
            self.permission_denied(
                self.request,
                message="You can only view enrollments for your own courses."
            )
        return obj

    def perform_create(self, serializer):
        student = self.request.user if self.request.user.role == 'student' else serializer.validated_data.get('student')
        course = serializer.validated_data.get('course')

        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError("Student is already enrolled in this course.")

        if self.request.user.role == 'student':
            serializer.save(student=self.request.user)
        else:
            serializer.save()

