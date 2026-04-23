from django.db import models
from django.conf import settings
from lsmapp.models import User
User = settings.AUTH_USER_MODEL

'''from django.contrib.auth import get_user_model
User = get_user_model()'''

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Video(models.Model):
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

class Lesson(models.Model):
    title=models.CharField(max_length=500)
    video_url=models.TextField()
    description=models.TextField()


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)


class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)


# Quiz MODEL
class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    duration = models.IntegerField()   

    def __str__(self):
        return f"{self.course.title} Quiz"


# QUESTION MODEL
class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    text = models.CharField(max_length=255)

    option1 = models.CharField(max_length=255)
    option2 = models.CharField(max_length=255)
    option3 = models.CharField(max_length=255)
    option4 = models.CharField(max_length=255)

    correct_option = models.IntegerField(default=1)