from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from courses.views import (
    CourseViewSet,
    VideoViewSet,
    EnrollmentViewSet,
    ProgressViewSet,
    CourseAssignmentViewSet
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()

router.register(r'courses', CourseViewSet, basename='courses')

router.register(r'videos', VideoViewSet, basename='videos')

router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')

router.register(r'progress', ProgressViewSet, basename='progress')

router.register(r'assignments', CourseAssignmentViewSet, basename='assignments')


urlpatterns = [

    path('admin/', admin.site.urls),

    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path('api/', include(router.urls)),

    path('api/users/', include('accounts.urls')),
]