# enrollment/models.py
from django.db import models
from django.utils import timezone
from users.models import CustomUser
from courses.models import Course


class Enrollment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'},
        help_text="Only students can be enrolled"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    requested_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)           # Tracks last activity
    progress = models.PositiveIntegerField(default=0)             # 0-100
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    certificate_issued = models.BooleanField(default=False)
    certificate_file = models.FileField(
        upload_to='certificates/',
        blank=True,
        null=True
    )

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-enrolled_at']
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        indexes = [
            models.Index(fields=['student', 'course']),
            models.Index(fields=['status', 'requested_at']),
            models.Index(fields=['completed', 'completed_at']),
            models.Index(fields=['last_accessed']),
        ]

    def __str__(self):
        return f"{self.student.email} - {self.course.title} ({self.get_status_display()})"

    @property
    def is_approved(self):
        return self.status == self.STATUS_APPROVED

    def approve(self):
        self.status = self.STATUS_APPROVED
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_at', 'last_accessed'])

    def reject(self):
        self.status = self.STATUS_REJECTED
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_at', 'last_accessed'])

    def save(self, *args, **kwargs):
        # Auto-complete logic
        if self.progress >= 100:
            self.progress = 100
            self.completed = True
            if not self.completed_at:
                self.completed_at = timezone.now()

        # Generate certificate only when course is completed for the first time
        if self.completed and not self.certificate_issued:
            self._generate_certificate()

        super().save(*args, **kwargs)

    def _generate_certificate(self):
        """Internal method to generate certificate"""
        try:
            from users.utils import generate_certificate
            cert_path = generate_certificate(self)
            self.certificate_file = cert_path
            self.certificate_issued = True
        except Exception as e:
            # Log error in production (don't crash save)
            print(f"Certificate generation failed: {e}")
            # Optionally: self.certificate_issued = False

    def update_progress(self, percentage: int):
        """Helper method to update progress safely"""
        if 0 <= percentage <= 100:
            self.progress = percentage
            self.save()
        else:
            raise ValueError("Progress must be between 0 and 100")
