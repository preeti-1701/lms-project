from django.contrib.auth.models import AbstractUser
from django.db import models
import json


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Course(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
    ]

    course_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    topics = models.JSONField(default=list, blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in hours")
    trainer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'trainer'},
        related_name='courses'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    version = models.CharField(max_length=100, default="1.0")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.course_id:
            last = Course.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.course_id = f"CRS{next_id:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course_id} - {self.title}"

    class Meta:
        ordering = ['-created_at']


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    video_url = models.URLField(help_text="YouTube embed URL only (e.g., https://www.youtube.com/embed/VIDEO_ID)")
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    class Meta:
        ordering = ['order', 'id']


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'}, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-enrolled_at']

