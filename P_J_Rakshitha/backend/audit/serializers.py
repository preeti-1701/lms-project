from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email',
            'action', 'ip_address',
            'device_info', 'metadata', 'timestamp'
        ]
        read_only_fields = fields