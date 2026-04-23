from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, LogoutAPIView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutAPIView.as_view(), name="logout"),
    path("", include(router.urls)),
]
