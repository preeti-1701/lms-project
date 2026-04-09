from django.db import models
from accounts.models import User

class LoginLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    device_info = models.TextField()
    login_time = models.DateTimeField(auto_now_add=True)