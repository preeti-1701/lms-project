"""
Session Serializers
"""
from rest_framework import serializers
from .models import UserSession


class UserSessionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    duration = serializers.ReadOnlyField()

    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'ip_address', 'device_type', 'browser', 'os',
            'is_active', 'created_at', 'last_activity',
            'logged_out_at', 'duration'
        ]
        read_only_fields = fields
