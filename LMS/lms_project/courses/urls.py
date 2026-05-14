
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    CourseViewSet,
    VideoViewSet,
    EnrollmentViewSet,
    ProgressViewSet,
    CourseAssignmentViewSet
)

router = DefaultRouter()

router.register(r'courses', CourseViewSet)

router.register(r'videos', VideoViewSet)

router.register(r'enrollments', EnrollmentViewSet)

router.register(r'progress', ProgressViewSet)

router.register(r'assignments', CourseAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

