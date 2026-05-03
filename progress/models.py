from django.conf import settings
from django.db import models


class Progress(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress_records',
        limit_choices_to={'role': 'student'},
    )
    lesson = models.ForeignKey(
        'courses.Lesson',
        on_delete=models.CASCADE,
        related_name='progress_records',
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'lesson']
        ordering = ['-updated_at']
        verbose_name_plural = 'progress records'

    def __str__(self):
        status = 'Completed' if self.is_completed else 'In Progress'
        return f'{self.student.username} - {self.lesson.title} ({status})'

