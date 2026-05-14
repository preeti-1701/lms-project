from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import current_user, UserViewSet

router = DefaultRouter()

router.register('users', UserViewSet)

urlpatterns = [

    path('me/', current_user),
    path('', include(router.urls)),

]