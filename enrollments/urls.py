from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet, VideoProgressViewSet

router = DefaultRouter()
router.register(r'', EnrollmentViewSet, basename='enrollment')
router.register(r'progress', VideoProgressViewSet, basename='video-progress')

urlpatterns = [
    path('', include(router.urls)),
]
