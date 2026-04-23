import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from courses.models import Course, Video

class Enrollment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def clean(self):
        if self.student.role != 'STUDENT':
            raise ValidationError('User must have the STUDENT role to be enrolled in a course.')

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"

class VideoProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    watch_percentage = models.FloatField(default=0.0)
    last_watched_at = models.DateTimeField(auto_now=True)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('enrollment', 'video')

    def save(self, *args, **kwargs):
        if self.watch_percentage >= 90:
            self.completed = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.enrollment.student.email} - {self.video.title} ({self.watch_percentage}%)"
