from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    
    # Role choices — the first value is stored in DB, second is for display
    class Role(models.TextChoices):
        ADMIN   = 'admin',   'Admin'
        TRAINER = 'trainer', 'Trainer'
        STUDENT = 'student', 'Student'

    
    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    is_staff = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"