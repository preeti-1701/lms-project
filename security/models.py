import uuid
from django.db import models
from django.conf import settings

class SecurityLog(models.Model):
    EVENT_TYPES = (
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('LOGIN_FAILED', 'Login Failed'),
        ('VIDEO_VIEW', 'Video View'),
        ('FORCE_LOGOUT', 'Force Logout'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    video = models.ForeignKey('courses.Video', on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    extra_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.event_type} - {self.user.email if self.user else 'Anonymous'} at {self.timestamp}"
