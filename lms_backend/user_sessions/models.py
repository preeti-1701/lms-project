from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class UserSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return str(self.user)