from django.db import models
import uuid
from accounts.models import CustomUser


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('VIDEO_ACCESS', 'Video Access'),
        ('COURSE_ACCESS', 'Course Access'),
        ('USER_CREATED', 'User Created'),
        ('USER_DISABLED', 'User Disabled'),
        ('COURSE_CREATED', 'Course Created'),
        ('COURSE_ASSIGNED', 'Course Assigned'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"