from __future__ import annotations

from rest_framework.permissions import BasePermission

from users.models import Profile


def _role(user) -> str:
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return Profile.ROLE_ADMIN
    try:
        return user.profile.role
    except Profile.DoesNotExist:
        return Profile.ROLE_STUDENT


def _approved(user) -> bool:
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return True
    try:
        return bool(user.profile.is_approved)
    except Profile.DoesNotExist:
        return True


class IsStudent(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and _role(user) == Profile.ROLE_STUDENT)


class IsApprovedTrainer(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and _role(user) == Profile.ROLE_TRAINER and _approved(user))


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and _role(user) == Profile.ROLE_ADMIN)
