from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOnly(permissions.BasePermission):
    """Only admin can create courses"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsTrainerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'trainer']

class IsTrainer(permissions.BasePermission):
    """Only trainer can add videos to their assigned courses"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'trainer'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'

class CanAddVideo(permissions.BasePermission):
    """Trainer can only add videos to courses assigned to them"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if request.user.role == 'trainer':
            return obj.trainer and obj.trainer.id == request.user.id
        return False
