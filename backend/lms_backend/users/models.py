from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    youtube_link = models.URLField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title