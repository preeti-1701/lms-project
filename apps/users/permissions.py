"""
Role-Based Access Control (RBAC) Permissions for LMS
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Full access — Admin role only."""
    message = 'Access denied. Admin role required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_admin or request.user.is_superuser)
        )


class IsTrainer(BasePermission):
    """Trainer role or higher."""
    message = 'Access denied. Trainer role required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ('admin', 'trainer') or
            getattr(request.user, 'is_superuser', False)
        )


class IsStudent(BasePermission):
    """Any authenticated user."""
    message = 'Access denied. Authentication required.'

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsAdminOrTrainer(BasePermission):
    """Admin or Trainer — can manage courses."""
    message = 'Access denied. Admin or Trainer role required.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ('admin', 'trainer') or request.user.is_superuser


class IsAdminOrReadOnly(BasePermission):
    """Admin has full access; others get read-only."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin or request.user.is_superuser


class IsOwnerOrAdmin(BasePermission):
    """Object-level: owner or admin can access."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin or request.user.is_superuser:
            return True
        # Check ownership — works for User objects and objects with user/owner field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        return obj == request.user


class CanViewCourse(BasePermission):
    """
    Students can view only their enrolled courses.
    Trainers can view courses they created.
    Admins can view all.
    """
    message = 'You are not enrolled in this course.'

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_admin or user.is_superuser:
            return True
        if user.is_trainer:
            return obj.created_by == user
        # Student: must be enrolled
        return obj.enrollments.filter(user=user, is_active=True).exists()
