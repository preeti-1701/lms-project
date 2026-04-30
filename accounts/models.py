"""Custom user model for the LMS.

Adds a `role` field to distinguish Admin, Trainer, and Student.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Application user with role-based permissions."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'          # Full control (Django + LMS)
        TRAINER = 'trainer', 'Trainer'    # Can create/manage courses
        STUDENT = 'student', 'Student'    # Can enroll & learn

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text="Determines what the user is allowed to do in the LMS.",
    )

    # ✅ Role helpers
    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_trainer_role(self) -> bool:
        return self.role == self.Role.TRAINER

    @property
    def is_student_role(self) -> bool:
        return self.role == self.Role.STUDENT

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"