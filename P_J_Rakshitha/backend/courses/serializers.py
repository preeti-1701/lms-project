from rest_framework import serializers
from .models import Course, CourseVideo, CourseAssignment, VideoProgress
from accounts.models import CustomUser


class CourseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVideo
        fields = ['id', 'title', 'youtube_video_id', 'order', 'added_at']
        read_only_fields = ['id', 'added_at']


class CourseSerializer(serializers.ModelSerializer):
    videos = CourseVideoSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.full_name',
        read_only=True
    )
    trainer_name = serializers.CharField(
        source='trainer.full_name',
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description',
            'created_by', 'created_by_name',
            'trainer', 'trainer_name',
            'is_active', 'created_at', 'videos'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']


class CourseAssignmentSerializer(serializers.ModelSerializer):
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseAssignment
        fields = [
            'id', 'course', 'course_title',
            'student', 'student_email', 'student_name',
            'assigned_at'
        ]
        read_only_fields = ['id', 'assigned_at']


class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ['id', 'student', 'video', 'watched', 'watched_at']
        read_only_fields = ['id', 'watched_at']


class StudentProgressSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    student_name = serializers.CharField()
    student_email = serializers.CharField()
    total_videos = serializers.IntegerField()
    watched_videos = serializers.IntegerField()
    percentage = serializers.FloatField()
    videos = serializers.ListField()