from django.conf import settings
from django.db import models


class Profile(models.Model):
	ROLE_ADMIN = 'admin'
	ROLE_TRAINER = 'trainer'
	ROLE_STUDENT = 'student'

	ROLE_CHOICES = (
		(ROLE_ADMIN, 'Admin'),
		(ROLE_TRAINER, 'Trainer'),
		(ROLE_STUDENT, 'Student'),
	)

	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='profile',
	)
	role = models.CharField(max_length=16, choices=ROLE_CHOICES, default=ROLE_STUDENT)
	is_approved = models.BooleanField(default=True)
	mobile = models.CharField(max_length=20, blank=True, null=True, unique=True)

	def __str__(self) -> str:
		return f"Profile(user_id={self.user_id}, role={self.role}, approved={self.is_approved})"


class UserSession(models.Model):
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='session',
	)
	current_access_jti = models.CharField(max_length=64, blank=True, default='')
	current_refresh_jti = models.CharField(max_length=64, blank=True, default='')
	ip_address = models.GenericIPAddressField(blank=True, null=True)
	user_agent = models.TextField(blank=True, default='')
	last_login_at = models.DateTimeField(blank=True, null=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self) -> str:
		return f"UserSession(user_id={self.user_id})"

