from django.db import models
from course.models import Course

class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    youtube_url = models.URLField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title