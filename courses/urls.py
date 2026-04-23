from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, VideoViewSet

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')
router.register(r'(?P<course_id>[^/.]+)/videos', VideoViewSet, basename='course-videos')

urlpatterns = [
    path('', include(router.urls)),
]
