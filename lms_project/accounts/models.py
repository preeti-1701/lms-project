from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models
1# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    active_session_key = models.CharField(max_length=255 , null= True , blank= True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


 