from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailMobileBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = (username or kwargs.get('identifier') or '').strip()
        if not identifier or not password:
            return None

        User = get_user_model()
        try:
            user = User.objects.get(Q(email__iexact=identifier) | Q(mobile=identifier) | Q(username__iexact=identifier))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
