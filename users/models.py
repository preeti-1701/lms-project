from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, blank=False)
    role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('trainer', 'Trainer'),
            ('student', 'Student')
        ],
        default='student'
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    last_session_key = models.CharField(max_length=40, blank=True, null=True)   # For single session

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    def __str__(self):
        return f"{self.email} ({self.role})"