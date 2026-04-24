from rest_framework import serializers
from .models import Course, CourseVideo, CourseAssignment, VideoProgress


class CourseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVideo
        fields = ['id', 'title', 'youtube_id', 'duration', 'sort_order', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    videos = CourseVideoSerializer(many=True, read_only=True)
    trainer_name = serializers.SerializerMethodField()
    total_videos = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'category',
                  'trainer_id', 'trainer_name', 'created_at', 'videos',
                  'total_videos', 'progress']

    def get_trainer_name(self, obj):
        if obj.trainer:
            return obj.trainer.get_full_name() or obj.trainer.username
        return 'Unknown'

    def get_total_videos(self, obj):
        return obj.videos.count()

    def get_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        try:
            role = request.user.user_role.role
        except Exception:
            role = 'student'
        if role != 'student':
            return 0
        total = obj.videos.count()
        if total == 0:
            return 0
        completed = VideoProgress.objects.filter(
            user=request.user,
            video__course=obj,
            completed=True
        ).count()
        return round((completed / total) * 100)


class CreateCourseSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    thumbnail = serializers.URLField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    trainer_id = serializers.IntegerField(required=False, allow_null=True)
    videos = CourseVideoSerializer(many=True, required=False)


class AssignCourseSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
