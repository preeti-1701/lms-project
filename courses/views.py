from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Course, Video
from .serializers import CourseSerializer, VideoSerializer
from accounts.permissions import IsAdmin, IsTrainer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Course.objects.all()
        elif user.role == 'TRAINER':
            return Course.objects.filter(created_by=user)
        else:
            # Student: show only enrolled courses
            return Course.objects.filter(enrollment__student=user, enrollment__is_active=True)

    def perform_create(self, serializer):
        # Strip empty thumbnail_url so URLField doesn't choke on non-URL strings
        thumb = serializer.validated_data.get('thumbnail_url') or None
        if thumb and not thumb.startswith('http'):
            thumb = None
        serializer.save(created_by=self.request.user, thumbnail_url=thumb)

    def perform_update(self, serializer):
        thumb = serializer.validated_data.get('thumbnail_url') or None
        if thumb and not thumb.startswith('http'):
            thumb = None
        serializer.save(thumbnail_url=thumb)

class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Video.objects.all()
        elif user.role == 'TRAINER':
            return Video.objects.filter(course__created_by=user)
        else:
            return Video.objects.filter(course__enrollment__student=user, course__enrollment__is_active=True)
