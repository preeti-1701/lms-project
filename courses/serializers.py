"""Serializers for the courses app."""
from rest_framework import serializers

from .models import Course, Enrollment, Lesson, LessonProgress


class LessonSerializer(serializers.ModelSerializer):
    """Lesson serializer; includes whether the requesting student has completed it."""

    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'course', 'title', 'content', 'video_url', 'order',
                  'created_at', 'is_completed')
        read_only_fields = ('created_at',)

    def get_is_completed(self, obj) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return LessonProgress.objects.filter(
            student=request.user, lesson=obj, completed=True
        ).exists()


class CourseSerializer(serializers.ModelSerializer):
    """Read/write serializer for courses.

    `instructor` is set automatically from the request user on create.
    """

    instructor_username = serializers.CharField(source='instructor.username', read_only=True)
    enrolled_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    lesson_count = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'video_url',
            'instructor', 'instructor_username',
            'enrolled_count', 'is_enrolled', 'lesson_count',
            'progress_percentage',
            'created_at', 'updated_at',
        )
        read_only_fields = ('instructor', 'created_at', 'updated_at')

    def get_enrolled_count(self, obj) -> int:
        return obj.enrollments.count()

    def get_is_enrolled(self, obj) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.enrollments.filter(student=request.user).exists()

    def get_progress_percentage(self, obj) -> int:
        """Percent of lessons in the course completed by the requesting user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        total = obj.lessons.count()
        if total == 0:
            return 0
        done = LessonProgress.objects.filter(
            student=request.user, lesson__course=obj, completed=True
        ).count()
        return int(round((done / total) * 100))


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for enrollment records (student-facing)."""

    course_title = serializers.CharField(source='course.title', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    completed_lessons = serializers.IntegerField(read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'course', 'course_title', 'enrolled_at',
                  'progress_percentage', 'completed_lessons', 'total_lessons',
                  'is_completed')
        read_only_fields = fields
