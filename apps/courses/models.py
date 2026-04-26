"""
Course, Video, and Enrollment Models for LMS
"""
import uuid
import re
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


def validate_youtube_url(value):
    """Validate that the URL is a valid YouTube video URL."""
    youtube_patterns = [
        r'(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+',
        r'(https?://)?(www\.)?youtu\.be/[\w-]+',
        r'(https?://)?(www\.)?youtube\.com/embed/[\w-]+',
    ]
    if not any(re.match(pattern, value) for pattern in youtube_patterns):
        raise ValidationError(
            _('%(value)s is not a valid YouTube URL.'),
            params={'value': value}
        )


def extract_youtube_id(url):
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r'(?:v=)([\w-]+)',
        r'youtu\.be/([\w-]+)',
        r'embed/([\w-]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


class Course(models.Model):
    """
    A learning course created by Admin or Trainer.
    Contains multiple videos (YouTube links).
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PUBLISHED = 'published', _('Published')
        ARCHIVED = 'archived', _('Archived')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_('title'), max_length=255, db_index=True)
    slug = models.SlugField(_('slug'), max_length=255, unique=True)
    description = models.TextField(_('description'), blank=True)
    thumbnail = models.ImageField(
        _('thumbnail'), upload_to='course_thumbnails/', null=True, blank=True
    )
    status = models.CharField(
        _('status'), max_length=10,
        choices=Status.choices, default=Status.DRAFT,
        db_index=True
    )

    # Ownership
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_courses',
        verbose_name=_('created by')
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"{self.title} [{self.status}]"

    @property
    def video_count(self):
        return self.videos.filter(is_active=True).count()

    @property
    def enrolled_count(self):
        return self.enrollments.filter(is_active=True).count()


class Video(models.Model):
    """
    A YouTube video linked to a Course.
    Students cannot download — video is embedded via YouTube iframe only.
    Dynamic watermarking is handled on the frontend.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE,
        related_name='videos', verbose_name=_('course')
    )
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    youtube_url = models.URLField(
        _('YouTube URL'), max_length=500,
        validators=[validate_youtube_url]
    )
    youtube_video_id = models.CharField(
        _('YouTube Video ID'), max_length=20,
        blank=True, help_text=_('Auto-extracted from URL')
    )
    order = models.PositiveIntegerField(_('order'), default=0)
    duration_minutes = models.PositiveIntegerField(
        _('duration (minutes)'), null=True, blank=True
    )
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Video')
        verbose_name_plural = _('Videos')
        ordering = ['course', 'order']
        unique_together = [['course', 'order']]

    def __str__(self):
        return f"{self.title} (Course: {self.course.title})"

    def save(self, *args, **kwargs):
        # Auto-extract YouTube ID
        if self.youtube_url and not self.youtube_video_id:
            self.youtube_video_id = extract_youtube_id(self.youtube_url) or ''
        super().save(*args, **kwargs)

    @property
    def embed_url(self):
        """Return safe embed URL — prevents direct download."""
        if self.youtube_video_id:
            return (
                f"https://www.youtube.com/embed/{self.youtube_video_id}"
                f"?rel=0&modestbranding=1&playsinline=1"
                f"&disablekb=0&fs=0"  # Disable fullscreen to reduce download risk
            )
        return None

    @property
    def thumbnail_url(self):
        if self.youtube_video_id:
            return f"https://img.youtube.com/vi/{self.youtube_video_id}/mqdefault.jpg"
        return None


class Enrollment(models.Model):
    """
    Maps a User (Student) to a Course.
    Admin or Trainer can create enrollments.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='enrollments', verbose_name=_('user')
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE,
        related_name='enrollments', verbose_name=_('course')
    )
    enrolled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='enrollments_created',
        verbose_name=_('enrolled by')
    )
    is_active = models.BooleanField(_('active'), default=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        _('expires at'), null=True, blank=True,
        help_text=_('Leave blank for unlimited access')
    )
    progress_percent = models.PositiveSmallIntegerField(
        _('progress (%)'), default=0
    )

    class Meta:
        verbose_name = _('Enrollment')
        verbose_name_plural = _('Enrollments')
        unique_together = [['user', 'course']]
        ordering = ['-enrolled_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['course', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.email} → {self.course.title}"


class VideoProgress(models.Model):
    """
    Track per-video viewing progress for enrolled students.
    """
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE,
        related_name='video_progress'
    )
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE,
        related_name='progress_records'
    )
    watched_seconds = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    last_watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Video Progress')
        verbose_name_plural = _('Video Progress Records')
        unique_together = [['enrollment', 'video']]
