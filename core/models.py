from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        TRAINER = 'trainer', 'Trainer'
        STUDENT = 'student', 'Student'

    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.STUDENT)

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.get_role_display()})'

    @property
    def is_admin_role(self):
        return self.is_superuser or self.role == self.Roles.ADMIN

    @property
    def is_trainer_role(self):
        return self.role == self.Roles.TRAINER

    @property
    def is_student_role(self):
        return self.role == self.Roles.STUDENT


class Course(models.Model):
    title = models.CharField(max_length=160)
    summary = models.TextField()
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='training_courses',
        limit_choices_to={'role': User.Roles.TRAINER},
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='assigned_courses',
        blank=True,
        limit_choices_to={'role': User.Roles.STUDENT},
    )
    cover_color = models.CharField(max_length=24, default='#1f7a8c')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=180)
    youtube_url = models.URLField()
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['course', 'order', 'title']

    def __str__(self):
        return f'{self.course}: {self.title}'

    @property
    def embed_url(self):
        parsed = urlparse(self.youtube_url)
        host = parsed.netloc.lower()
        video_id = ''
        if 'youtu.be' in host:
            video_id = parsed.path.strip('/').split('/')[0]
        elif 'youtube.com' in host:
            if parsed.path.startswith('/embed/'):
                video_id = parsed.path.split('/embed/', 1)[1].split('/')[0]
            else:
                video_id = parse_qs(parsed.query).get('v', [''])[0]
        if not video_id:
            return self.youtube_url
        return f'https://www.youtube-nocookie.com/embed/{video_id}?rel=0&modestbranding=1'


class UserSession(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tracked_session')
    session_key = models.CharField(max_length=80, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    force_logged_out = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.user} - {self.ip_address or "unknown IP"}'

# Create your models here.
