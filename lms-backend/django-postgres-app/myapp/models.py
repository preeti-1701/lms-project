from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("trainer", "Trainer"),
        ("admin", "Admin"),
    ]
    STATUS_CHOICES = [
        ("active", "Active"),
        ("disabled", "Disabled"),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    mobile = models.CharField(max_length=20, blank=True, default="")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    # Trainer-specific fields
    subject = models.CharField(max_length=200, blank=True, default="")
    qualification = models.CharField(max_length=200, blank=True, default="")
    experience = models.CharField(max_length=100, blank=True, default="")
    bio = models.TextField(blank=True, default="")

    # Student-specific fields
    interests = models.JSONField(default=list, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return f"{self.name} ({self.role})"


class Course(models.Model):
    CATEGORY_CHOICES = [
        ("Web Development", "Web Development"),
        ("Data Science", "Data Science"),
        ("Mobile Development", "Mobile Development"),
        ("Cloud Computing", "Cloud Computing"),
        ("Cybersecurity", "Cybersecurity"),
        ("AI/ML", "AI/ML"),
        ("Other", "Other"),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default="Other")
    icon = models.CharField(max_length=10, default="📚")
    trainer = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name="courses_created",
        limit_choices_to={"role": "trainer"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=300)
    url = models.URLField()
    duration = models.CharField(max_length=20, blank=True, default="—")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} — {self.title}"


class Enrollment(models.Model):
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="enrollments",
        limit_choices_to={"role": "student"},
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.name} enrolled in {self.course.title}"


class VideoProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="progress")
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="progress")
    watched = models.BooleanField(default=False)
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "video")

    def __str__(self):
        return f"{self.student.name} — {self.video.title} — {'✓' if self.watched else '✗'}"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
        ("CREATED", "Created"),
        ("DISABLED", "Disabled"),
        ("FORCED", "Force Logout"),
        ("ENROLLED", "Enrolled"),
        ("UNENROLLED", "Unenrolled"),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.user} — {self.action} at {self.timestamp}"