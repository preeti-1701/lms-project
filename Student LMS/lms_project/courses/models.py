from django.db import models
from accounts.models import CustomUser

from django.conf import settings

User = settings.AUTH_USER_MODEL



class Course(models.Model):

    title = models.CharField(max_length=200)

    description = models.TextField()

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )

    trainers = models.ManyToManyField(
        CustomUser,
        blank=True,
        related_name='trainer_courses'
    )

    def __str__(self):

        return self.title


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student} -> {self.course}"
    
    
class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    completed = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student} - {self.video}"
    
class CourseAssignment(models.Model):

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.user.username} - {self.course.title}"