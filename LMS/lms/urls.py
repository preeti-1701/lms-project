from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, logout_view, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("", include(router.urls)),
]
