from rest_framework import serializers
from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_id_display = serializers.CharField(source='course.course_id', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'student_name',
            'course',
            'course_title',
            'course_id_display',
            'enrolled_at',
        ]
        read_only_fields = ['id', 'enrolled_at', 'student_name', 'course_title', 'course_id_display']

    def validate(self, data):
        student = data.get('student')
        course = data.get('course')
        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError("Student is already enrolled in this course.")
        return data

