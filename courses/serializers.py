from rest_framework import serializers
from .models import Course, Lesson


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'youtube_url', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            from enrollments.models import Enrollment
            is_enrolled = Enrollment.objects.filter(
                student=request.user,
                course=instance.course
            ).exists()
            if not is_enrolled:
                data.pop('youtube_url', None)
        return data


class CourseSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    trainer_name = serializers.CharField(source='trainer.username', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'course_id',
            'title',
            'description',
            'topics',
            'duration',
            'trainer',
            'trainer_name',
            'status',
            'lessons',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'course_id', 'created_at', 'updated_at']

    def get_lessons(self, obj):
        request = self.context.get('request')
        context = {'request': request} if request else {}
        serializer = LessonSerializer(obj.lessons.all(), many=True, context=context)
        return serializer.data

