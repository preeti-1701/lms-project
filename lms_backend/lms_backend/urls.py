from django.contrib import admin
from django.urls import path, include
from courses.views import DashboardView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('courses.urls')),

    path('api/dashboard/', DashboardView.as_view()),

    path('api/login/', TokenObtainPairView.as_view()),
    path('api/refresh/', TokenRefreshView.as_view()),
]