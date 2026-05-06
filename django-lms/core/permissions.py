from functools import wraps
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

from .models import Role


def user_roles(user):
    if not user.is_authenticated:
        return set()
    return set(user.roles.values_list("role", flat=True))


def has_role(user, *roles):
    return bool(user_roles(user) & set(roles))


def role_required(*roles):
    """Decorator: require login and at least one of the given roles."""
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def _wrapped(request, *args, **kwargs):
            if not has_role(request.user, *roles):
                raise PermissionDenied("You don't have access to this page.")
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator


# Convenient helpers
def is_admin(user): return has_role(user, Role.ADMIN)
def is_trainer(user): return has_role(user, Role.TRAINER)
def is_staff_role(user): return has_role(user, Role.ADMIN, Role.TRAINER)
