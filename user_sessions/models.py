from django.db import models
from users.models import User

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=255)
    login_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def _str_(self):
        return f"{self.user} - {self.session_key}"