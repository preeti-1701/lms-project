from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)
    video_url = models.URLField()

    def __str__(self):
        return self.title


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()

    def __str__(self):
        return self.title