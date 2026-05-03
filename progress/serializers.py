from rest_framework import serializers
from .models import Progress


class ProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.course.title', read_only=True)

    class Meta:
        model = Progress
        fields = [
            'id',
            'student',
            'student_name',
            'lesson',
            'lesson_title',
            'course_title',
            'is_completed',
            'completed_at',
            'updated_at',
        ]
        # ✅ MAKE STUDENT READ-ONLY (VERY IMPORTANT)
        read_only_fields = [
            'id',
            'student',
            'completed_at',
            'updated_at',
            'student_name',
            'lesson_title',
            'course_title'
        ]