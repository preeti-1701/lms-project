from __future__ import annotations

from rest_framework.permissions import BasePermission

from .models import Profile


class IsAdmin(BasePermission):
    """Allows access only to admins.

    Admin is:
    - Django staff/superuser, OR
    - a user whose Profile.role is 'admin'
    """

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return False

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return True

        try:
            return user.profile.role == Profile.ROLE_ADMIN
        except Profile.DoesNotExist:
            return False


class IsApprovedTrainerOrAdmin(BasePermission):
    """Allows access to approved trainers and admins.

    This is meant for trainer-only endpoints (e.g. course/video management).
    Pending trainers (role='trainer' and is_approved=False) are blocked.
    """

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return False

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return True

        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return False

        if profile.role == Profile.ROLE_ADMIN:
            return True

        return profile.role == Profile.ROLE_TRAINER and bool(profile.is_approved)
