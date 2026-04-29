from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=50, blank=True)
    duration = models.CharField(max_length=50, blank=True)
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, null = True, blank=True)
    is_archived=models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id} - {self.title}"


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)   # 👈 ADD THIS
    youtube_link = models.URLField()

    def __str__(self):
        return f"{self.title} ({self.course.title})"


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student} enrolled in {self.course}"
    

class VideoProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)