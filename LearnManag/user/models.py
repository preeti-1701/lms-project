from django.contrib.auth.models import BaseUserManager,AbstractBaseUser, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):

    def create_user(self, email, name, password=None, role='student'):
        if not email:
            raise ValueError("User must have an email")

        user = self.model(
            email=self.normalize_email(email),
            name=name,
            role=role
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(
            email=email,
            name=name,
            password=password,
            role='admin'
        )

        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
    

class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    active_session_key = models.CharField(max_length=40, blank=True, null=True)
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    last_device = models.CharField(max_length=255, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email
    

class SecurityViolation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='security_violations')
    reason = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.reason}"
