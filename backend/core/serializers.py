from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Video, Enrollment, VideoProgress, SecurityNotification

User = get_user_model()


# =========================
# USER SERIALIZER
# =========================
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'mobile', 'role', 'is_active', 'password',
            'video_token', 'video_token_expiry'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)

        user = User(**validated_data)
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


# =========================
# VIDEO SERIALIZER
# =========================
class VideoSerializer(serializers.ModelSerializer):
    url = serializers.URLField(write_only=True, required=False, source='youtube_url')
    video_url = serializers.SerializerMethodField()
    watch_url = serializers.SerializerMethodField()
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False)

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'course', 'youtube_url', 'url',
            'video_url', 'watch_url', 'order', 'duration', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_video_url(self, obj):
        """Returns embed URL for inline playback"""
        if obj.youtube_url:
            if 'youtube.com' in obj.youtube_url or 'youtu.be' in obj.youtube_url:
                return obj.youtube_embed_url
            else:
                return obj.youtube_url
        return None

    def get_watch_url(self, obj):
        """Returns original YouTube URL for opening in new tab"""
        if obj.youtube_url:
            return obj.youtube_url
        return None

    def to_internal_value(self, data):
        if 'url' in data and 'youtube_url' not in data:
            data = data.copy()
            data['youtube_url'] = data.pop('url')
        return super().to_internal_value(data)


# =========================
# COURSE SERIALIZER
# =========================
class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    video_count = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()
    created_by_email = serializers.CharField(
        source='created_by.email', read_only=True
    )

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description',
            'trainer', 'trainer_name',
            'created_at', 'created_by_email',
            'videos', 'video_count', 'is_active'
        ]
        read_only_fields = ['id', 'created_at']

    def get_video_count(self, obj):
        return obj.videos.count()

    def get_trainer_name(self, obj):
        if obj.trainer:
            return f"{obj.trainer.first_name} {obj.trainer.last_name}".strip() or obj.trainer.email
        return None

    def create(self, validated_data):
        # Set trainer if not provided
        if 'trainer' not in validated_data:
            validated_data['trainer'] = self.context['request'].user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Only admin can change trainer
        request = self.context.get('request')
        if request and request.user.role != 'admin':
            validated_data.pop('trainer', None)
        return super().update(instance, validated_data)


# =========================
# ENROLLMENT SERIALIZER
# =========================
class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source='course.title', read_only=True
    )
    student_email = serializers.CharField(
        source='student.email', read_only=True
    )
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'))

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course',
            'course_title', 'student_email',
            'enrolled_at', 'is_active'
        ]
        read_only_fields = ['id', 'enrolled_at']


# =========================
# PROGRESS SERIALIZER
# =========================
class VideoProgressSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(
        source='video.title', read_only=True
    )

    class Meta:
        model = VideoProgress
        fields = [
            'id', 'student', 'video', 'video_title',
            'watched', 'last_position', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


# =========================
# LOGIN SERIALIZER
# =========================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# =========================
# SECURITY NOTIFICATION SERIALIZER
# =========================
class SecurityNotificationSerializer(serializers.ModelSerializer):
    student_email = serializers.CharField(source='student.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)
    
    class Meta:
        model = SecurityNotification
        fields = [
            'id', 'student', 'student_email',
            'notification_type', 'course', 'course_title',
            'video', 'video_title', 'description',
            'user_agent', 'ip_address',
            'created_at', 'is_read'
        ]
        read_only_fields = ['id', 'created_at']
