from django.db import models
from users.models import CustomUser
from courses.models import Course

class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    certificate_issued = models.BooleanField(default=False)
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"