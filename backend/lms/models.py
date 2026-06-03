from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import re


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    def is_admin(self):
        return self.role == 'admin'

    def is_trainer(self):
        return self.role == 'trainer'

    def is_student(self):
        return self.role == 'student'


class UserSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='active_session')
    session_key = models.CharField(max_length=40)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.session_key}"


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Course(models.Model):
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                 related_name='courses_taught', limit_choices_to={'role': 'trainer'})
    level = models.CharField(max_length=15, choices=LEVEL_CHOICES, default='beginner')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def total_lessons(self):
        return self.lessons.count()

    def enrolled_count(self):
        return self.enrollments.filter(is_active=True).count()


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    youtube_url = models.URLField()
    youtube_id = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        url = self.youtube_url
        patterns = [
            r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
            r'youtu\.be/([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                self.youtube_id = match.group(1)
                break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    def get_embed_url(self):
        if self.youtube_id:
            return f"https://www.youtube.com/embed/{self.youtube_id}"
        return ""


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"

    def progress_percent(self):
        total = self.course.total_lessons()
        if total == 0:
            return 0
        done = LessonProgress.objects.filter(enrollment=self, completed=True).count()
        return int((done / total) * 100)


class LessonProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progresses')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('enrollment', 'lesson')

    def mark_complete(self):
        self.completed = True
        self.completed_at = timezone.now()
        self.save()
        enrollment = self.enrollment
        total = enrollment.course.total_lessons()
        done = LessonProgress.objects.filter(enrollment=enrollment, completed=True).count()
        if total > 0 and done >= total:
            enrollment.completed = True
            enrollment.save()

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.lesson.title}"
