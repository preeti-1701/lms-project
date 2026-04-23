from rest_framework import serializers
from .models import Enrollment, LessonProgress


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            'id', 'student', 'student_username', 'course',
            'course_title', 'status', 'enrolled_at', 'completed_at'
        )
        read_only_fields = ('id', 'student', 'enrolled_at', 'status')


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LessonProgress
        fields = (
            'id', 'lesson', 'lesson_title', 'is_completed',
            'watch_time_seconds', 'completed_at'
        )
        read_only_fields = ('id', 'completed_at')