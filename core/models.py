import secrets

from django.conf import settings
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.contrib.sessions.models import Session
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class Profile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        TRAINER = "trainer", "Trainer"
        STUDENT = "student", "Student"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    mobile = models.CharField(max_length=20, blank=True)
    active_session_key = models.CharField(max_length=64, blank=True)
    session_token = models.CharField(max_length=64, blank=True)

    def __str__(self) -> str:
        return f"{self.user.username} ({self.get_role_display()})"


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_courses",
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="Enrollment",
        related_name="enrolled_courses",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self) -> str:
        return f"{self.student.username} -> {self.course.title}"


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=200)
    youtube_url = models.URLField()
    brief_detail = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self) -> str:
        return self.title


class SessionActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_key = models.CharField(max_length=64, blank=True)
    logged_in_at = models.DateTimeField(default=timezone.now)
    logged_out_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-logged_in_at"]

    def __str__(self) -> str:
        return f"{self.user.username} @ {self.logged_in_at:%Y-%m-%d %H:%M}"


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()


@receiver(user_logged_in)
def enforce_single_session(sender, user, request, **kwargs):
    profile = user.profile
    current_key = request.session.session_key or ""

    if profile.active_session_key and profile.active_session_key != current_key:
        Session.objects.filter(session_key=profile.active_session_key).delete()
        SessionActivity.objects.filter(
            user=user,
            session_key=profile.active_session_key,
            is_active=True,
        ).update(is_active=False, logged_out_at=timezone.now())

    token = secrets.token_hex(16)
    request.session["auth_token"] = token

    profile.active_session_key = current_key
    profile.session_token = token
    profile.save(update_fields=["active_session_key", "session_token"])

    SessionActivity.objects.create(
        user=user,
        ip_address=_get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
        session_key=current_key,
    )


@receiver(user_logged_out)
def close_session_activity(sender, user, request, **kwargs):
    if not user:
        return

    session_key = request.session.session_key or ""
    SessionActivity.objects.filter(
        user=user,
        session_key=session_key,
        is_active=True,
    ).update(is_active=False, logged_out_at=timezone.now())



def _get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
