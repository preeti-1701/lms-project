from django.db import models
from django.contrib.auth.models import User


class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_sessions')
    device_info = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    login_at = models.DateTimeField(auto_now_add=True)
    logout_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'user_sessions'
        ordering = ['-login_at']

    def __str__(self):
        return f"{self.user.email} - {self.login_at}"
