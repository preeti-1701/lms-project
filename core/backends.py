from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import Profile

User = get_user_model()


class EmailOrMobileBackend(ModelBackend):
    """Authenticate with username, email, or profile mobile."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = username or kwargs.get("email") or kwargs.get("mobile")
        if not identifier or not password:
            return None

        user = (
            User.objects.select_related("profile")
            .filter(
                Q(username__iexact=identifier)
                | Q(email__iexact=identifier)
                | Q(profile__mobile=identifier)
            )
            .first()
        )
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

