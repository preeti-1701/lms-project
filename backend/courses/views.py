from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Course, Video, UserCourse
from .serializers import CourseSerializer, CourseCreateSerializer, VideoSerializer, VideoCreateSerializer, AssignCourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Course.objects.all().prefetch_related('videos')
        elif user.role == 'trainer':
            return Course.objects.filter(created_by=user).prefetch_related('videos')
        else:
            return Course.objects.filter(usercourse__user=user).prefetch_related('videos')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_video(self, request, pk=None):
        course = self.get_object()
        serializer = VideoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        video = Video.objects.create(
            course=course,
            title=serializer.validated_data['title'],
            youtube_url=serializer.validated_data['youtube_url'],
            order=serializer.validated_data.get('order', 0)
        )
        
        return Response(VideoSerializer(video).data, status=201)
    
    @action(detail=True, methods=['delete'], url_path='videos/(?P<video_id>[^/.]+)')
    def remove_video(self, request, pk=None, video_id=None):
        course = self.get_object()
        try:
            video = course.videos.get(id=video_id)
            video.delete()
            return Response({'message': 'Video removed'})
        except Video.DoesNotExist:
            return Response({'error': 'Video not found'}, status=404)
    
    @action(detail=False, methods=['post'])
    def assign(self, request):
        serializer = AssignCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        UserCourse.objects.get_or_create(
            user_id=serializer.validated_data['user_id'],
            course_id=serializer.validated_data['course_id']
        )
        return Response({'message': 'Course assigned'})