import uuid
from django.conf import settings
from django.db import models


class Course(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_UPCOMING = 'upcoming'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_UPCOMING, 'Upcoming'),
    ]

    course_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    topics = models.JSONField(default=list, blank=True)
    duration = models.PositiveIntegerField(
        help_text='Duration in hours',
        default=0,
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses',
        limit_choices_to={'role': 'trainer'},
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_UPCOMING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.course_id:
            self.course_id = self._generate_course_id()
        super().save(*args, **kwargs)

    def _generate_course_id(self):
        import datetime
        year = datetime.datetime.now().year
        suffix = uuid.uuid4().hex[:4].upper()
        return f'COURSE{year}{suffix}'

    def __str__(self):
        return f'{self.course_id} - {self.title}'


class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lessons',
    )
    title = models.CharField(max_length=255)
    youtube_url = models.URLField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['course', 'order']

    def __str__(self):
        return f'{self.course.course_id} - Lesson {self.order}: {self.title}'

