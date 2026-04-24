from rest_framework import serializers
from .models import CustomUser, Course, Video, Enrollment, VideoProgress, AuditLog


# ── User ──────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Full user representation (used by admin)."""

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "name", "mobile", "role", "status",
            "joined", "last_login", "interests",
            "subject", "qualification", "experience", "bio",
        ]
        read_only_fields = ["id", "joined", "last_login"]


class RegisterStudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ["name", "email", "mobile", "password", "interests"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(role="student", **validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterTrainerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = [
            "name", "email", "mobile", "password",
            "subject", "qualification", "experience", "bio",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(role="trainer", **validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()   # email / mobile / admin-id
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=["student", "trainer", "admin"])


# ── Video ─────────────────────────────────────────────────────────────────────

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "title", "url", "duration", "order"]


# ── Course ────────────────────────────────────────────────────────────────────

class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    trainer_name = serializers.CharField(source="trainer.name", read_only=True)
    trainer_id = serializers.IntegerField(source="trainer.id", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "description", "category", "icon",
            "trainer_id", "trainer_name", "created_at", "videos",
        ]
        read_only_fields = ["id", "created_at", "trainer_id", "trainer_name"]


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["title", "description", "category", "icon"]


# ── Enrollment ────────────────────────────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = Enrollment
        fields = ["id", "course", "course_id", "enrolled_at"]
        read_only_fields = ["id", "enrolled_at"]


# ── Video Progress ─────────────────────────────────────────────────────────────

class VideoProgressSerializer(serializers.ModelSerializer):
    video_id = serializers.PrimaryKeyRelatedField(
        queryset=Video.objects.all(), source="video", write_only=True
    )
    course_id = serializers.IntegerField(source="video.course.id", read_only=True)

    class Meta:
        model = VideoProgress
        fields = ["id", "video_id", "course_id", "watched", "watched_at"]
        read_only_fields = ["id", "watched_at", "course_id"]


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = AuditLog
        fields = ["id", "user_id", "user_name", "action", "timestamp", "ip_address", "details"]
        read_only_fields = ["id", "timestamp"]
