from rest_framework import serializers
from .models import Course, Video, UserCourse

class VideoSerializer(serializers.ModelSerializer):
    youtube_watch_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = ['id', 'title', 'youtube_url', 'youtube_watch_url', 'order']
    
    def get_youtube_watch_url(self, obj):
        return obj.get_youtube_watch_url()

class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'videos', 'video_count', 'created_by', 'created_by_name', 'created_at']
    
    def get_video_count(self, obj):
        return obj.videos.count()

class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description']

class VideoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['title', 'youtube_url', 'order']

class AssignCourseSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    course_id = serializers.UUIDField()