from django.db import models
from courses.models import Course
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Enrollment(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrolled_courses'
    )

    course = models.ForeignKey(Course, on_delete=models.CASCADE,  related_name='enrollments')

    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_courses'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} -> {self.course}"