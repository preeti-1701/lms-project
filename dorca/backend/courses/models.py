from django.db import models
from django.contrib.auth.models import User


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    thumbnail = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class CourseVideo(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    youtube_id = models.CharField(max_length=20)
    duration = models.CharField(max_length=20, blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'course_videos'
        ordering = ['sort_order']

    def __str__(self):
        return self.title


class CourseAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_assignments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'course_assignments'
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.email} -> {self.course.title}"


class VideoProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_progress')
    video = models.ForeignKey(CourseVideo, on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    last_watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'video_progress'
        unique_together = ('user', 'video')

    def __str__(self):
        return f"{self.user.email} - {self.video.title}"
