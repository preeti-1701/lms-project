from django.db import models
from django.contrib.auth.models import User


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    video_file = models.FileField(upload_to='videos/')


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)


from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=15, blank=True)
    age = models.IntegerField(null=True, blank=True)

    # ✅ allow empty
    birthdate = models.DateField(null=True, blank=True)

    education = models.CharField(max_length=200, blank=True)

    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profiles/', null=True, blank=True)