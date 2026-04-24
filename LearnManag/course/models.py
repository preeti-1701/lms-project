from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()

    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'trainer'},
        related_name='courses_created'
    )

    students = models.ManyToManyField(
        User,
        limit_choices_to={'role': 'student'},
        related_name='courses_enrolled',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
