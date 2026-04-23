import uuid
import re
from django.db import models
from django.conf import settings

class Course(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail_url = models.URLField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    category = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Video(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    youtube_url = models.URLField()
    embed_url = models.URLField(blank=True)
    position = models.PositiveIntegerField()
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position']

    def save(self, *args, **kwargs):
        if self.youtube_url:
            self.embed_url = self._generate_embed_url(self.youtube_url)
        super().save(*args, **kwargs)

    def _generate_embed_url(self, url):
        video_id = None
        if 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[1].split('?')[0]
        elif 'watch?v=' in url:
            video_id = url.split('watch?v=')[1].split('&')[0]
        elif 'embed/' in url:
            video_id = url.split('embed/')[1].split('?')[0]
        if video_id:
            return f"https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1&controls=0"
        return url

    def __str__(self):
        return self.title
