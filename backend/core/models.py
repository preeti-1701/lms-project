from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# ================= USER MANAGER =================
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        return self.create_user(email, password, **extra_fields)


# ================= USER MODEL =================
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )

    username = None  # ❌ disable username
    email = models.EmailField(unique=True)

    mobile = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    is_active = models.BooleanField(default=True)

    # Security tracking
    session_token = models.CharField(max_length=255, blank=True, null=True)
    video_token = models.CharField(max_length=255, blank=True, null=True)
    video_token_expiry = models.DateTimeField(blank=True, null=True)
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    last_device = models.CharField(max_length=255, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'   # 🔥 IMPORTANT for login
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


# ================= COURSE =================
class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Assign trainer to course
    trainer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='courses',
        limit_choices_to={'role': 'trainer'}, null=True, blank=True
    )

    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_courses'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


# ================= VIDEO =================
class Video(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='videos'
    )

    title = models.CharField(max_length=255)
    youtube_url = models.URLField()
    order = models.PositiveIntegerField(default=1)
    duration = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def youtube_embed_url(self):
        url = self.youtube_url

        if 'watch?v=' in url:
            video_id = url.split('watch?v=')[1].split('&')[0]
        elif 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[1].split('?')[0]
        elif 'embed/' in url:
            video_id = url.split('embed/')[1].split('?')[0]
        else:
            video_id = url

        return f"https://www.youtube.com/embed/{video_id}"


# ================= ENROLLMENT =================
class Enrollment(models.Model):
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='enrollments'
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='enrollments'
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"


# ================= VIDEO PROGRESS =================
class VideoProgress(models.Model):
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='video_progress'
    )
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name='progress'
    )

    watched = models.BooleanField(default=False)
    last_position = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'video')

    def __str__(self):
        return f"{self.student.email} - {self.video.title}"


# ================= SECURITY NOTIFICATION =================
class SecurityNotification(models.Model):
    """
    Model to track security events: screenshot attempts, watermarks, etc.
    """
    NOTIFICATION_TYPES = (
        ('screenshot', 'Screenshot Attempt'),
        ('screen_record', 'Screen Recording Attempt'),
        ('print', 'Print Attempt'),
        ('watermark', 'Watermark Detection'),
        ('right_click', 'Right Click Attempt'),
        ('download', 'Download Attempt'),
    )

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='security_notifications'
    )
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, null=True, blank=True,
        related_name='security_notifications'
    )
    
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, null=True, blank=True,
        related_name='security_notifications'
    )
    
    description = models.TextField()
    
    # Browser/device info
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} - {self.notification_type} - {self.created_at}"
