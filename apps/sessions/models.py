"""
Session Tracking Model for LMS
Tracks IP, device, user agent per login. Enforces single active session.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class UserSession(models.Model):
    """
    Tracks every login session.
    Only one session per user can be is_active=True at a time.
    Admin can force-logout by setting is_active=False.
    """

    class DeviceType(models.TextChoices):
        DESKTOP = 'desktop', _('Desktop')
        MOBILE = 'mobile', _('Mobile')
        TABLET = 'tablet', _('Tablet')
        UNKNOWN = 'unknown', _('Unknown')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='user_sessions', verbose_name=_('user')
    )
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    device_type = models.CharField(
        _('device type'), max_length=10,
        choices=DeviceType.choices, default=DeviceType.UNKNOWN
    )
    browser = models.CharField(_('browser'), max_length=100, blank=True)
    os = models.CharField(_('operating system'), max_length=100, blank=True)

    # Token reference (partial — never store full token)
    access_token = models.CharField(_('access token ref'), max_length=100, blank=True)

    # Status
    is_active = models.BooleanField(_('active'), default=True, db_index=True)

    # Timestamps
    created_at = models.DateTimeField(_('login time'), auto_now_add=True)
    last_activity = models.DateTimeField(_('last activity'), auto_now=True)
    logged_out_at = models.DateTimeField(_('logout time'), null=True, blank=True)

    class Meta:
        verbose_name = _('User Session')
        verbose_name_plural = _('User Sessions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        status = 'Active' if self.is_active else 'Ended'
        return f"{self.user.email} | {self.ip_address} | {self.device_type} | {status}"

    @property
    def duration(self):
        if self.logged_out_at:
            return self.logged_out_at - self.created_at
        from django.utils import timezone
        return timezone.now() - self.created_at
