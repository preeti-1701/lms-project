from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class IsTrainer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'trainer'


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'student'


class IsAdminOrTrainer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role in ['admin', 'trainer']