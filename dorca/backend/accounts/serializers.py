from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserRole, Profile


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'is_active', 'date_joined', 'avatar_url']

    def get_role(self, obj):
        try:
            return obj.user_role.role
        except UserRole.DoesNotExist:
            return 'student'

    def get_is_active(self, obj):
        try:
            return obj.profile.is_active
        except Profile.DoesNotExist:
            return True

    def get_avatar_url(self, obj):
        try:
            return obj.profile.avatar_url
        except Profile.DoesNotExist:
            return None

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class CreateUserSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    role = serializers.ChoiceField(choices=['admin', 'trainer', 'student'], default='student')
