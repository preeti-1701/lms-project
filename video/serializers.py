from rest_framework import serializers
from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    duration_display = serializers.ReadOnlyField()
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Video
        fields = (
            'id', 'lesson', 'lesson_title', 'title',
            'description',                              
            'youtube_url', 'youtube_embed_url',
            'duration_seconds', 'duration_display',
            'created_at'
        )
        read_only_fields = ('id', 'youtube_embed_url', 'created_at', 'duration_display')