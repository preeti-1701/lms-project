from rest_framework import serializers
from .models import Enrollment
from courses.serializers import CourseSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    class Meta:
        model = Enrollment
        fields = '__all__'