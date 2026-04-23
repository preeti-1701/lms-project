from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, LogoutView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("", include(router.urls)),
]
