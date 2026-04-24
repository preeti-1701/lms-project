from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Video, Enrollment, VideoProgress

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'mobile', 'role', 'is_active', 'password'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class VideoSerializer(serializers.ModelSerializer):
    youtube_embed_url = serializers.ReadOnlyField()

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'youtube_url',
            'youtube_embed_url', 'order',
            'duration', 'created_at'
        ]


class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.email', read_only=True
    )
    video_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description',
            'created_by', 'created_by_name',
            'created_at', 'updated_at',
            'is_active', 'videos', 'video_count'
        ]
        read_only_fields = ['created_by']

    def get_video_count(self, obj):
        return obj.videos.count()


class CourseListSerializer(serializers.ModelSerializer):
    video_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description',
            'created_at', 'is_active', 'video_count'
        ]

    def get_video_count(self, obj):
        return obj.videos.count()


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source='course.title', read_only=True
    )
    student_email = serializers.CharField(
        source='student.email', read_only=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course',
            'course_title', 'student_email',
            'enrolled_at', 'is_active'
        ]


class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = [
            'id', 'video', 'watched',
            'last_position', 'updated_at'
        ]


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()