from django.db import models
from django.contrib.auth.models import User


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title


class Video(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="videos"
    )
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()

    def __str__(self):
        return self.title


# 🔥 ENROLLMENT MODEL (ADD THIS)
class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} -> {self.course.title}"


# 🔥 VIDEO PROGRESS
class VideoProgress(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE
    )

    completed = models.BooleanField(
        default=False
    )

    # ✅ NEW
    last_watched_seconds = models.IntegerField(
        default=0
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = ('user', 'video')

class ActiveSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.TextField()

    def __str__(self):
        return self.user.username
    
class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question = models.TextField()

    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200)
    option4 = models.CharField(max_length=200)

    correct_answer = models.CharField(max_length=200)


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
