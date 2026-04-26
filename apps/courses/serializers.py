"""
Course, Video, Enrollment Serializers
"""
from django.utils.text import slugify
from rest_framework import serializers
from .models import Course, Video, Enrollment, VideoProgress


class VideoSerializer(serializers.ModelSerializer):
    embed_url = serializers.ReadOnlyField()
    thumbnail_url = serializers.ReadOnlyField()

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'youtube_url',
            'youtube_video_id', 'embed_url', 'thumbnail_url',
            'order', 'duration_minutes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'youtube_video_id', 'embed_url', 'thumbnail_url', 'created_at']

    def validate_youtube_url(self, value):
        from .models import extract_youtube_id
        if not extract_youtube_id(value):
            raise serializers.ValidationError('Could not extract video ID from URL.')
        return value


class VideoListSerializer(serializers.ModelSerializer):
    """Lightweight — for course detail view."""
    embed_url = serializers.ReadOnlyField()
    thumbnail_url = serializers.ReadOnlyField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'order', 'duration_minutes',
                  'embed_url', 'thumbnail_url', 'is_active']


class CourseListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    video_count = serializers.IntegerField(read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'thumbnail',
            'status', 'created_by_name', 'video_count',
            'enrolled_count', 'created_at'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    videos = VideoListSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    video_count = serializers.IntegerField(read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'thumbnail',
            'status', 'created_by', 'created_by_name', 'videos',
            'video_count', 'enrolled_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_by', 'created_at', 'updated_at']


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'thumbnail', 'status']

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Title must be at least 3 characters.')
        return value.strip()

    def create(self, validated_data):
        # Auto-generate unique slug
        base_slug = slugify(validated_data['title'])
        slug = base_slug
        counter = 1
        while Course.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        validated_data['slug'] = slug
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    enrolled_by_name = serializers.CharField(
        source='enrolled_by.get_full_name', read_only=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'course', 'course_title', 'enrolled_by', 'enrolled_by_name',
            'is_active', 'enrolled_at', 'expires_at', 'progress_percent'
        ]
        read_only_fields = ['id', 'enrolled_by', 'enrolled_at', 'progress_percent']

    def validate(self, attrs):
        user = attrs.get('user')
        course = attrs.get('course')

        # Only students can be enrolled
        if user and user.role not in ('student', 'admin'):
            # Allow admin to enroll themselves for testing
            if user.role not in ('student',) and not self.context['request'].user.is_admin:
                raise serializers.ValidationError(
                    {'user': 'Only students can be enrolled in courses.'}
                )

        # Check duplicate
        if user and course:
            exists = Enrollment.objects.filter(user=user, course=course)
            if self.instance:
                exists = exists.exclude(pk=self.instance.pk)
            if exists.exists():
                raise serializers.ValidationError(
                    {'detail': 'User is already enrolled in this course.'}
                )
        return attrs

    def create(self, validated_data):
        validated_data['enrolled_by'] = self.context['request'].user
        return super().create(validated_data)


class BulkEnrollSerializer(serializers.Serializer):
    """Enroll multiple users in a course at once."""
    course_id = serializers.UUIDField()
    user_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1, max_length=100
    )

    def validate_course_id(self, value):
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError('Course not found.')
        return value


class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ['id', 'video', 'watched_seconds', 'is_completed', 'last_watched_at']
        read_only_fields = ['id', 'last_watched_at']
