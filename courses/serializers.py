from rest_framework import serializers
from .models import Course, Video

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'
        read_only_fields = ('embed_url',)

class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    thumbnail_url = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')
