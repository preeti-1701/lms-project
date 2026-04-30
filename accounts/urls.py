"""Auth API endpoints.

POST /api/auth/register/   create account
POST /api/auth/login/      obtain JWT access + refresh
POST /api/auth/refresh/    refresh access token
POST /api/auth/logout/     blacklist refresh token (best-effort)
GET  /api/auth/me/         current user profile
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import api_views

urlpatterns = [
    path('register/', api_views.RegisterAPIView.as_view(), name='api-register'),
    path('login/', TokenObtainPairView.as_view(), name='api-login'),
    path('refresh/', TokenRefreshView.as_view(), name='api-refresh'),
    path('logout/', api_views.LogoutAPIView.as_view(), name='api-logout'),
    path('me/', api_views.MeAPIView.as_view(), name='api-me'),
]
