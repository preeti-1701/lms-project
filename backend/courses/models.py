from django.db import models

from users.models import User


# ✅ COURSE

class Course(models.Model):

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.title


# ✅ VIDEO

class Video(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="videos"
    )

    title = models.CharField(
        max_length=200
    )

    video_url = models.URLField()

    def __str__(self):

        return self.title


# ✅ ENROLLMENT

class Enrollment(models.Model):

    student = models.ForeignKey(

        User,

        on_delete=models.CASCADE
    )

    course = models.ForeignKey(

        Course,

        on_delete=models.CASCADE
    )

    enrolled_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.student.username} - {self.course.title}"


# ✅ PROGRESS

class Progress(models.Model):

    student = models.ForeignKey(

        User,

        on_delete=models.CASCADE
    )

    course = models.ForeignKey(

        Course,

        on_delete=models.CASCADE
    )

    completed_videos = models.IntegerField(
        default=0
    )

    total_videos = models.IntegerField(
        default=0
    )

    percentage = models.FloatField(
        default=0
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if self.total_videos > 0:

            self.percentage = (

                self.completed_videos
                /
                self.total_videos

            ) * 100

        super().save(*args, **kwargs)

    def __str__(self):

        return f"{self.student.username} Progress"


# ✅ CERTIFICATE

class Certificate(models.Model):

    student = models.ForeignKey(

        User,

        on_delete=models.CASCADE
    )

    course = models.ForeignKey(

        Course,

        on_delete=models.CASCADE
    )

    certificate_id = models.CharField(

        max_length=100,

        unique=True
    )

    issued_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"Certificate - {self.student.username}"