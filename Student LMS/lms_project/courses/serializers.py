from rest_framework import serializers
from .models import Course, Video, Enrollment, Progress, CourseAssignment
from accounts.models import CustomUser


class UserSerializer(serializers.ModelSerializer):

    class Meta:

        model = CustomUser

        fields = [
            'id',
            'username',
            'email',
            'role',
            'password'
        ]

        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):

        password = validated_data.pop('password')

        user = CustomUser(**validated_data)

        user.set_password(password)

        user.save()

        return user

# ================= VIDEO =================

class VideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Video
        fields = '__all__'


# ================= COURSE =================


class CourseSerializer(serializers.ModelSerializer):

    class Meta:

        model = Course

        fields = '__all__'


# ================= ENROLLMENT =================

class EnrollmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrollment
        fields = '__all__'


# ================= PROGRESS =================

class ProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Progress
        fields = '__all__'

        read_only_fields = ['student']

# ================= COURSE ASSIGNMENT =================
class CourseAssignmentSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = CourseAssignment
        fields = '__all__'