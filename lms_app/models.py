# ============================================
# LMS APP MODELS
# FILE: lms_app/models.py
# ============================================

from django.db import models
from django.contrib.auth.models import User


# ============================================
# PROFILE MODEL
# ============================================

class Profile(models.Model):

    ROLE_CHOICES = (

        ('student', 'Student'),

        ('trainer', 'Trainer'),

        ('admin', 'Admin'),

    )

    user = models.OneToOneField(

        User,

        on_delete=models.CASCADE

    )

    role = models.CharField(

        max_length=20,

        choices=ROLE_CHOICES,

        default='student'

    )

    full_name = models.CharField(

        max_length=100,

        blank=True,

        null=True

    )

    roll_number = models.CharField(

        max_length=50,

        blank=True,

        null=True

    )

    phone = models.CharField(

        max_length=15,

        blank=True,

        null=True

    )

    age = models.IntegerField(

        blank=True,

        null=True

    )

    dob = models.DateField(

        blank=True,

        null=True

    )

    college = models.CharField(

        max_length=200,

        blank=True,

        null=True

    )

    branch = models.CharField(

        max_length=100,

        blank=True,

        null=True

    )

    profile_image = models.ImageField(

        upload_to='profile_images/',

        blank=True,

        null=True

    )

    bio = models.TextField(

        blank=True,

        null=True

    )

    created_at = models.DateTimeField(

        auto_now_add=True

    )

    def __str__(self):

        return self.user.username


# ============================================
# COURSE MODEL
# ============================================

class Course(models.Model):

    LEVEL_CHOICES = (

        ('Beginner', 'Beginner'),

        ('Intermediate', 'Intermediate'),

        ('Advanced', 'Advanced'),

    )

    title = models.CharField(

        max_length=200

    )

    category = models.CharField(

        max_length=100,

        blank=True,

        null=True

    )

    trainer = models.CharField(

        max_length=100,

        blank=True,

        null=True

    )

    price = models.IntegerField(

        blank=True,

        null=True

    )

    description = models.TextField()

    duration = models.CharField(

        max_length=50,

        blank=True,

        null=True

    )

    level = models.CharField(

        max_length=50,

        choices=LEVEL_CHOICES,

        default='Beginner'

    )

    image = models.ImageField(

        upload_to='course_images/',

        blank=True,

        null=True

    )

    youtube_link = models.URLField(

        blank=True,

        null=True

    )

    created_by = models.ForeignKey(

        User,

        on_delete=models.CASCADE,

        null=True,

        blank=True

    )

    created_at = models.DateTimeField(

        auto_now_add=True

    )

    updated_at = models.DateTimeField(

        auto_now=True

    )

    is_active = models.BooleanField(

        default=True

    )

    def __str__(self):

        return self.title


# ============================================
# VIDEO MODEL
# ============================================

class Video(models.Model):

    course = models.ForeignKey(

        Course,

        on_delete=models.CASCADE,

        related_name='videos'

    )

    title = models.CharField(

        max_length=200

    )

    youtube_link = models.URLField()

    order = models.IntegerField(

        default=1

    )

    created_at = models.DateTimeField(

        auto_now_add=True

    )

    def __str__(self):

        return self.title

    class Meta:

        ordering = ['order']


# ============================================
# ENROLLMENT MODEL
# ============================================

class Enrollment(models.Model):

    student = models.ForeignKey(

        User,

        on_delete=models.CASCADE

    )

    course = models.ForeignKey(

        Course,

        on_delete=models.CASCADE

    )

    progress = models.IntegerField(

        default=0

    )

    completed = models.BooleanField(

        default=False

    )

    certificate_issued = models.BooleanField(

        default=False

    )

    enrolled_at = models.DateTimeField(

        auto_now_add=True

    )

    updated_at = models.DateTimeField(

        auto_now=True

    )

    def __str__(self):

        return f"{self.student.username} - {self.course.title}"


# ============================================
# SECURITY ALERT MODEL
# ============================================

class SecurityAlert(models.Model):

    user = models.ForeignKey(

        User,

        on_delete=models.CASCADE

    )

    alert_type = models.CharField(

        max_length=100

    )

    message = models.TextField()

    created_at = models.DateTimeField(

        auto_now_add=True

    )

    resolved = models.BooleanField(

        default=False

    )

    def __str__(self):

        return f"{self.user.username} - {self.alert_type}"