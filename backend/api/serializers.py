from rest_framework import serializers
from rest_framework import serializers
from users.models import User, UserSession, AuditLog, Notification, Ticket
from courses.models import Course, CourseVideo, CourseMaterial

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    class Meta:
        model = Ticket
        fields = ['id', 'user_email', 'subject', 'description', 'status', 'created_at', 'updated_at']

class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = ['id', 'title', 'file_type', 'file', 'uploaded_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'role', 'status', 'first_name', 'last_name', 'is_active']

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'role', 'status', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Generate username from email to satisfy AbstractUser requirements
        if 'username' not in validated_data:
            validated_data['username'] = validated_data.get('email').split('@')[0] + str(User.objects.count() + 1)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSessionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserSession
        fields = ['id', 'user_email', 'ip_address', 'device_info', 'created_at', 'is_active']

class CourseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVideo
        fields = ['id', 'title', 'youtube_link', 'order', 'created_at']

class CourseSerializer(serializers.ModelSerializer):
    videos = CourseVideoSerializer(many=True, read_only=True)
    assigned_users = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'status', 'max_capacity', 'enrollment_deadline', 'created_at', 'updated_at', 'videos', 'assigned_users']

    def _sync_enrollments(self, course, users):
        from courses.models import Enrollment
        # Remove old enrollments not in users list
        Enrollment.objects.filter(course=course).exclude(user__in=users).delete()
        
        # Enforce capacity
        capacity = course.max_capacity
        existing_enrolled_count = Enrollment.objects.filter(course=course, status='ENROLLED').count()
        
        for user in users:
            enrollment, created = Enrollment.objects.get_or_create(course=course, user=user)
            if created or enrollment.status == 'WAITLISTED':
                # If there's capacity or no capacity limit
                if capacity is None or capacity <= 0 or existing_enrolled_count < capacity:
                    enrollment.status = 'ENROLLED'
                    existing_enrolled_count += 1
                else:
                    enrollment.status = 'WAITLISTED'
                enrollment.save()

    def create(self, validated_data):
        users = validated_data.pop('assigned_users', [])
        course = super().create(validated_data)
        self._sync_enrollments(course, users)
        return course

    def update(self, instance, validated_data):
        users = validated_data.pop('assigned_users', None)
        course = super().update(instance, validated_data)
        if users is not None:
            self._sync_enrollments(course, users)
        return course
