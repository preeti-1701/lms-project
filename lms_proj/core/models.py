
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    age = models.IntegerField(null=True, blank=True)

    # REMOVE unwanted admin clutter display
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='core_users',
        blank=True
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='core_users_permissions',
        blank=True
    )

    def __str__(self):
        return self.username


class Course(models.Model):

    COURSE_CHOICES = (
        ('python', 'Python'),
        ('sql', 'SQL'),
        ('java', 'Java'),
        ('django', 'Django'),
    )

    title = models.CharField(max_length=100, choices=COURSE_CHOICES)
    description = models.TextField()
    topics = models.TextField()
    duration = models.CharField(max_length=50)

    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'trainer'}
    )

    students = models.ManyToManyField(
        User,
        related_name="courses",
        blank=True,
        limit_choices_to={'role': 'student'}
    )

    status = models.CharField(
        max_length=20,
        choices=[('active','Active'), ('upcoming','Upcoming')],
        default='upcoming'
    )

    def __str__(self):
        return self.title

# ---------------- VIDEO MODEL ----------------
class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()

    def __str__(self):
        return self.title