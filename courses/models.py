from django.db import models
from django.contrib.auth.models import User
import re


class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin',   'Admin'),
        ('student', 'Student'),
        ('trainer', 'Trainer'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Course(models.Model):
    STATUS_CHOICES = [
        ('active',   'Active'),
        ('upcoming', 'Upcoming'),
        ('inactive', 'Inactive'),
    ]
    title        = models.CharField(max_length=200)
    edition      = models.CharField(max_length=200, blank=True)
    description  = models.TextField()
    topics       = models.TextField(help_text="Comma separated topics", blank=True)
    duration     = models.CharField(max_length=100, blank=True)
    trainer      = models.ForeignKey(
                     User, on_delete=models.SET_NULL,
                     null=True, blank=True,
                     related_name='assigned_courses'
                   )
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    youtube_url  = models.URLField(blank=True, help_text="YouTube video URL e.g. https://www.youtube.com/watch?v=xxxx")
    created_at   = models.DateTimeField(auto_now_add=True)

    def get_topics_list(self):
        return [t.strip() for t in self.topics.split(',') if t.strip()]

    def get_youtube_embed_url(self):
        """Convert any YouTube URL format to embed URL"""
        if not self.youtube_url:
            return None
        pattern = r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})'
        match = re.search(pattern, self.youtube_url)
        if match:
            video_id = match.group(1)
            return f"https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1"
        return None

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} → {self.course.title}"
