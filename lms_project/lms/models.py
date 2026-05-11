from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

#user models
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True, null=True)
    active_token = models.CharField(max_length=255, blank=True, null=True)
    

#course model
class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey('User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
#enrollment model
class Enrollment(models.Model):
    student = models.ForeignKey('User', on_delete=models.CASCADE)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'   # 👈 ADD THIS
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
        

#video model
class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    youtube_url = models.URLField()
    order = models.PositiveIntegerField(default=0)
    
#  LOGIN ACTIVITY
class LoginActivity(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    device = models.CharField(max_length=255)

    ip_address = models.CharField(max_length=100)

    login_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.ip_address}"