"""Reusable DRF permission classes for the LMS."""
from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Allow only LMS admins/instructors (or Django superusers)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return user.is_superuser or getattr(user, 'is_admin_role', False)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Read access for everyone authenticated, write only for admins."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return user.is_superuser or getattr(user, 'is_admin_role', False)
