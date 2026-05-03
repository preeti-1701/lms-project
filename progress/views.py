from rest_framework import viewsets, permissions, serializers
from .models import Progress
from .serializers import ProgressSerializer
from courses.permissions import IsAdmin, IsStudent
from enrollments.models import Enrollment


class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAdmin | IsStudent]
        elif self.action in ['destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Progress.objects.all()
        elif user.role == 'student':
            return Progress.objects.filter(student=user)
        elif user.role == 'trainer':
            return Progress.objects.filter(lesson__course__trainer=user)
        return Progress.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        lesson = serializer.validated_data.get('lesson')

        # ✅ Ensure lesson exists
        if not lesson:
            raise serializers.ValidationError("Lesson is required.")

        # ✅ Ensure student is enrolled
        if user.role == 'student':
            is_enrolled = Enrollment.objects.filter(
                student=user,
                course=lesson.course
            ).exists()

            if not is_enrolled:
                raise serializers.ValidationError(
                    "You are not enrolled in this course."
                )

            # ✅ Prevent duplicate progress
            existing = Progress.objects.filter(
                student=user,
                lesson=lesson
            ).first()

            if existing:
                existing.is_completed = True
                existing.save()
                return

            # ✅ Save progress
            serializer.save(student=user, is_completed=True)

        else:
            # Admin case
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user

        if user.role == 'student' and serializer.instance.student != user:
            raise serializers.ValidationError(
                "You can only update your own progress."
            )

        serializer.save()