from django.db import models
from django.contrib.auth.models import AbstractUser


# 👤 USER MODEL (ROLE SYSTEM)
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    def __str__(self):
        return self.username


# 📚 COURSE MODEL
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="courses"
    )

    def __str__(self):
        return self.title


# 🎥 VIDEO MODEL
class Video(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="videos"
    )
    title = models.CharField(max_length=200)
    youtube_url = models.URLField()

    def __str__(self):
        return self.title

    def get_embed_url(self):
        url = self.youtube_url

        if "watch?v=" in url:
            video_id = url.split("watch?v=")[1].split("&")[0]
            return f"https://www.youtube.com/embed/{video_id}"

        if "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1]
            return f"https://www.youtube.com/embed/{video_id}"

        return url


# 🎓 ENROLLMENT MODEL
class Enrollment(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"


# 📊 PROGRESS MODEL (IMPORTANT FIXED VERSION)
class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'video')  # 🔥 prevents duplicate progress

    def __str__(self):
        return f"{self.student.username} - {self.video.title}"