from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User with roles
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

# Course
class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

# Videos (YouTube links)
class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    youtube_link = models.URLField()
    duration = models.CharField(max_length=10, blank=True, null=True)

# Enrollment + progress
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)