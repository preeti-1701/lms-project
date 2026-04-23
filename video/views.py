from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Video
from .serializers import VideoSerializer
from courses.models import Lesson


class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('instructor', 'admin')


class VideoCreateView(generics.CreateAPIView):
    """Instructor uploads video to their lesson"""
    serializer_class = VideoSerializer
    permission_classes = (IsInstructorOrAdmin,)

    def perform_create(self, serializer):
        lesson = Lesson.objects.get(id=self.kwargs['lesson_id'])
        if lesson.course.instructor != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied('You can only add videos to your own lessons.')
        serializer.save(lesson=lesson)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET  — enrolled students or instructor
    PUT/DELETE — instructor owner only
    """
    serializer_class = VideoSerializer
    queryset = Video.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsInstructorOrAdmin()]