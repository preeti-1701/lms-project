from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/admin/', views.admin_dashboard, name='admin-dashboard'),
    path('dashboard/trainer/', views.trainer_dashboard, name='trainer-dashboard'),
    path('my-courses/', views.student_dashboard, name='student-dashboard'),
    path('courses/', views.course_list, name='course-list'),
    path('courses/new/', views.course_new, name='course-new'),
    path('courses/<str:course_id>/', views.course_detail, name='course-detail'),
    path('courses/<str:course_id>/watch/<str:video_id>/', views.video_player, name='video-player'),
    path('admin-panel/users/', views.user_list, name='user-list'),
    path('enrollments/', views.enrollment_list, name='enrollment-list'),
    path('security/logs/', views.security_logs, name='security-logs'),
]
