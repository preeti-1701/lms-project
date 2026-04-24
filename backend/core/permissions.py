from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'trainer'


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsAdminOrTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'trainer']


class IsEnrolledOrAdminTrainer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role in ['admin', 'trainer']:
            return True

        if user.role == 'student':
            course = obj if hasattr(obj, 'enrollments') else obj.course
            return course.enrollments.filter(student=user, is_active=True).exists()

        return False