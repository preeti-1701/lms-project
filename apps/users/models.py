"""
Custom User Model for LMS
Supports email/mobile login with role-based access control.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """
    Custom manager supporting email or mobile number as username.
    """
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(_('Email address is required.'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashes password via PBKDF2
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model.
    - Primary identifier: email
    - Optional mobile number (also usable for login via API)
    - Role: Admin | Trainer | Student
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        TRAINER = 'trainer', _('Trainer')
        STUDENT = 'student', _('Student')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ── Identity ──────────────────────────────────────────────
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    mobile = models.CharField(
        _('mobile number'), max_length=20, blank=True,
        null=True, unique=True, db_index=True
    )
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)

    # ── Role & Status ─────────────────────────────────────────
    role = models.CharField(
        _('role'), max_length=10,
        choices=Role.choices, default=Role.STUDENT,
        db_index=True
    )
    is_active = models.BooleanField(
        _('active'), default=True,
        help_text=_('Disable this to deactivate account without deletion.')
    )
    is_staff = models.BooleanField(_('staff status'), default=False)

    # ── Timestamps ────────────────────────────────────────────
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    last_login = models.DateTimeField(_('last login'), null=True, blank=True)

    # ── Profile ───────────────────────────────────────────────
    avatar = models.ImageField(
        _('avatar'), upload_to='avatars/', null=True, blank=True
    )
    bio = models.TextField(_('bio'), blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['mobile']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}> [{self.role}]"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_trainer(self):
        return self.role == self.Role.TRAINER

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT
