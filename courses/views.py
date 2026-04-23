from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils.text import slugify
from .models import Category, Course, Lesson
from .serializers import (
    CategorySerializer, CourseSerializer,
    CourseListSerializer, LessonSerializer
)


class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'instructor'


class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('instructor', 'admin')


class IsCourseOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or obj.instructor == request.user


# ── Category ──────────────────────────────────────────────
class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]  # only admin creates categories
        return [permissions.AllowAny()]


# ── Course ────────────────────────────────────────────────
class CourseListView(generics.ListAPIView):
    """Public — list all published courses"""
    serializer_class = CourseListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Course.objects.filter(is_published=True)


class CourseCreateView(generics.CreateAPIView):
    """Instructor only — create a course"""
    serializer_class = CourseSerializer
    permission_classes = (IsInstructor,)

    def perform_create(self, serializer):
        title = serializer.validated_data['title']
        serializer.save(
            instructor=self.request.user,
            slug=slugify(title)
        )


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET  — anyone can view a published course
    PUT/PATCH/DELETE — instructor owner or admin only
    """
    serializer_class = CourseSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsCourseOwnerOrAdmin()]

    def get_queryset(self):
        return Course.objects.all()

    def perform_update(self, serializer):
        serializer.save(slug=slugify(serializer.validated_data.get('title', self.get_object().title)))


class InstructorCourseListView(generics.ListAPIView):
    """Instructor sees only their own courses including unpublished"""
    serializer_class = CourseListSerializer
    permission_classes = (IsInstructor,)

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)


# ── Lesson ────────────────────────────────────────────────
class LessonCreateView(generics.CreateAPIView):
    """Instructor only — add lesson to their course"""
    serializer_class = LessonSerializer
    permission_classes = (IsInstructor,)

    def perform_create(self, serializer):
        course = Course.objects.get(slug=self.kwargs['slug'])
        if course.instructor != self.request.user:
            raise PermissionDenied('You can only add lessons to your own courses.')
        serializer.save(course=course)


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET — anyone, PUT/DELETE — instructor owner only"""
    serializer_class = LessonSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsCourseOwnerOrAdmin()]

    def get_queryset(self):
        return Lesson.objects.filter(course__slug=self.kwargs['slug'])