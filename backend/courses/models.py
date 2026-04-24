from django.db import models
from users.models import User

class Course(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    max_capacity = models.IntegerField(null=True, blank=True, help_text="Maximum number of students")
    enrollment_deadline = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Many to many relationship for assignments with through table
    assigned_users = models.ManyToManyField(User, related_name='assigned_courses', blank=True, through='Enrollment')

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('ENROLLED', 'Enrolled'),
        ('WAITLISTED', 'Waitlisted'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='ENROLLED')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.email} - {self.course.title} ({self.status})"


class CourseVideo(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    youtube_link = models.URLField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class CourseMaterial(models.Model):
    MATERIAL_TYPES = (
        ('VIDEO', 'Video'),
        ('PDF', 'PDF Document'),
        ('ASSIGNMENT', 'Assignment'),
        ('CERTIFICATE', 'Certificate'),
        ('OTHER', 'Other'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=255)
    file_type = models.CharField(max_length=15, choices=MATERIAL_TYPES, default='OTHER')
    file = models.FileField(upload_to='course_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.title} - {self.title} ({self.file_type})"
