"""
Database models for the LMS.

Roles:
    - admin   : full control (create users, courses, assign)
    - trainer : add videos
    - student : can view courses and enroll them 
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    """Custom user. We add `role` and `mobile` so users can sign in with email or mobile."""
    ROLE_ADMIN = 'admin'
    ROLE_TRAINER = 'trainer'
    ROLE_STUDENT = 'student'
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_TRAINER, 'Trainer'),
        (ROLE_STUDENT, 'Student'),
    ]

    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, blank=True, null=True, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    is_disabled = models.BooleanField(default=False)

    
    active_session_key = models.CharField(max_length=64, blank=True, null=True)

    REQUIRED_FIELDS = ['email']  # username still required by AbstractUser

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    @property
    def is_trainer(self):
        return self.role == self.ROLE_TRAINER

    @property
    def is_student(self):
        return self.role == self.ROLE_STUDENT


class Course(models.Model):
    """A course created by an admin or trainer."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class CourseVideo(models.Model):
    """A YouTube video belonging to a course."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    youtube_url = models.URLField(help_text="Full YouTube URL")
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseAssignment(models.Model):
    """Links a student to a course they are allowed to view."""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='assignments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"


class SessionInfo(models.Model):
    """Tracks IP and device info for each login (SRS: session control)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name='session_logs')
    session_key = models.CharField(max_length=64)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    login_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} @ {self.ip_address} ({self.login_at:%Y-%m-%d %H:%M})"

class EnrollmentRequest(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} -> {self.course} ({self.status})"
    
class VideoProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey(CourseVideo, on_delete=models.CASCADE)
    watched = models.BooleanField(default=False)
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'video')

    def __str__(self):
        return f"{self.student.username} - {self.video.title}"