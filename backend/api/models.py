from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    active_token = models.TextField(blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    def __str__(self):
        return self.email

class Course(models.Model):
    STATUS_CHOICES = (('active', 'Active'), ('draft', 'Draft'),)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    trainer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title

class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    youtube_url = models.URLField()
    order = models.IntegerField(default=0)
    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('student', 'course')
    def __str__(self):
        return f"{self.student.email} - {self.course.title}"

class SessionLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sessions')
    ip_address = models.GenericIPAddressField(null=True)
    device_info = models.TextField(blank=True)
    logged_in_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.user.email} - {self.logged_in_at}"