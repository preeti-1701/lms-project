from django.db import models
from users.models import CustomUser

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    trainer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)   # Admin approval

    def __str__(self):
        return self.title

class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()          # YouTube video link
    order = models.PositiveIntegerField(default=1)
    duration = models.CharField(max_length=20, blank=True)  # e.g., "10:25"

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"