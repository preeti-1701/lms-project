from django.db import models
from users.models import User

class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


# NEW MODEL 👇
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.course.title}"