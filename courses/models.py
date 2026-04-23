from django.db import models

# Create your models here.
from django.db import models
from users.models import User


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_courses')
    assigned_students = models.ManyToManyField(
    User,
    related_name='enrolled_courses',
    limit_choices_to={'role': 'student'}
)
    def __str__(self):
        return self.title


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    youtube_link = models.URLField()

    def __str__(self):
        return self.title