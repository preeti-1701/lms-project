from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone


# ===================== USER MODEL =====================
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username


# ===================== SESSION MODEL =====================
class UserSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # ✅ TEMP: allow null for migration safety
    session_token = models.CharField(max_length=255, unique=True, null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.session_token}"