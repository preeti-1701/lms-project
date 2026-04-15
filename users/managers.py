import re
from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError


def validate_password_strength(password):
    """
    Password: -  8 characters -  one number -  one uppercase letter
    """
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not re.search(r'\d', password):
        raise ValidationError("Password must contain at least one number.")
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Password must contain at least one uppercase letter.")


class UserManager(BaseUserManager):

    def create_user(self, email, password, role='student', **extra_fields):
        
        if not email:
            raise ValueError("Email address is required.")

        email = self.normalize_email(email)

        validate_password_strength(password)

        user = self.model(email=email, role=role, **extra_fields)

        user.set_password(password)

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, role='admin', **extra_fields)