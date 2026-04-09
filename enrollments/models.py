from django.db import models
from accounts.models import User
from courses.models import Course

class Enrollment(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrolled_courses'
    )

    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_courses'
    )

    created_at = models.DateTimeField(auto_now_add=True)