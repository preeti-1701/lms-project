from rest_framework import serializers
from .models import Course, Video, VideoProgress


class VideoSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'youtube_link', 'completed']

    def get_completed(self, obj):
        user = self.context['request'].user
        progress = VideoProgress.objects.filter(user=user, video=obj).first()
        return progress.completed if progress else False


class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'videos']