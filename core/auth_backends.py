"""Custom authentication backend — accepts email or username."""
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User


class EmailOrUsernameBackend(ModelBackend):
    """Authenticate by matching the input against either username or email."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        try:
            # Check email first (case-insensitive) then username
            user = User.objects.get(Q(email__iexact=username) | Q(username__iexact=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # Edge case: someone's username equals someone else's email. Prefer email match.
            user = User.objects.filter(email__iexact=username).first() or User.objects.filter(username__iexact=username).first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
