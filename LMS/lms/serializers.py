from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, LoginSession


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("email already exists")
        return value.lower()

    def validate_role(self, value):
        if value not in ["admin", "trainer", "student"]:
            raise serializers.ValidationError("invalid role")
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "role"]

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("email already exists")
        return value

    def validate_role(self, value):
        if value not in ["admin", "trainer", "student"]:
            raise serializers.ValidationError("invalid role")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get("email", "").lower()
        password = data.get("password", "")
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("user account is disabled")
        data["user"] = user
        return data
