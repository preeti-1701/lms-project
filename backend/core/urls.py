from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    CourseViewSet,
    VideoViewSet,
    EnrollmentViewSet,
    VideoProgressViewSet,
    login_view,
    logout_view,
    me_view,
    refresh_token_view,
    dashboard_stats,
    report_security_violation,
    secure_video_token,
    get_security_notifications,
    get_dashboard_notifications,
    force_logout_user,
    get_active_sessions
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'videos', VideoViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'progress', VideoProgressViewSet )

urlpatterns = [
    # AUTH
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),
    path('auth/me/', me_view),
    path('auth/refresh/', refresh_token_view),

    # DASHBOARD
    path('dashboard/stats/', dashboard_stats),
    path('dashboard/notifications/', get_dashboard_notifications),

    # SECURITY
    path('security/report/', report_security_violation),  # Enhanced with auto-logout
    path('security/notifications/', get_security_notifications),
    path('security/token/', secure_video_token),

    # SESSION MANAGEMENT (Admin only)
    path('admin/force-logout/', force_logout_user),
    path('admin/active-sessions/', get_active_sessions),

    # API ROUTES
    path('', include(router.urls)),
]
