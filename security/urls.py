from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SecurityLogViewSet

router = DefaultRouter()
router.register(r'logs', SecurityLogViewSet, basename='security-log')

urlpatterns = [
    path('', include(router.urls)),
]
