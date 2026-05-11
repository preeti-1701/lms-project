from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, VideoViewSet, register_user

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'videos', VideoViewSet)

urlpatterns = router.urls
path('register/', register_user),