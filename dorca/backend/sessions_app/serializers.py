from rest_framework import serializers
from .models import UserSession


class SessionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = UserSession
        fields = ['id', 'user_id', 'user_name', 'user_email', 'device_info',
                  'ip_address', 'is_active', 'login_at', 'logout_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_user_email(self, obj):
        return obj.user.email
