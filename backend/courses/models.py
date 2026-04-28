from django.db import models
from users.models import User

class Course(models.Model):
    title = models.CharField(max_length=200)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


# ✅ ADD THIS
class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=200)
    video_url = models.URLField()

    def __str__(self):
        return self.title