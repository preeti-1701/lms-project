from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')

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

class EnrollmentExpiry(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    expires_at = models.DateTimeField(null=True, blank=True) # null means lifetime access

    class Meta:
        unique_together = ('course', 'student')

class EnrollmentRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollment_requests')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'}, related_name='enrollment_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'student')
        
    def __str__(self):
        return f"{self.student.email} - {self.course.title} ({self.status})"
