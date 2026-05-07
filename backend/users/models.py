from django.contrib.auth.models import AbstractUser

from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (

        ('admin', 'Admin'),

        ('trainer', 'Trainer'),

        ('student', 'Student'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    is_disabled = models.BooleanField(
        default=False
    )