from django.db import models
from users.models import User

class Course(models.Model):
    title = models.CharField(max_length=100)

    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='trainer_courses'
    )

    students = models.ManyToManyField(
        User,
        related_name='student_courses'
    )

    youtube_link = models.URLField()

    def __str__(self):
        return self.title