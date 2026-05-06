from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup_view, name='signup'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('manage/enrollments/', views.manage_enrollments, name='manage_enrollments'),
    path('manage/enrollments/<int:req_id>/approve/', views.approve_enrollment, name='approve_enrollment'),
    path('manage/enrollments/<int:req_id>/reject/', views.reject_enrollment, name='reject_enrollment'),

    path('courses/', views.course_list, name='course_list'),
    path('courses/<int:course_id>/', views.course_detail, name='course_detail'),
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),

    path('manage/courses/', views.manage_courses, name='manage_courses'),
    path('manage/courses/new/', views.manage_course_create, name='manage_course_create'),
    path('manage/courses/<int:course_id>/', views.manage_course_detail, name='manage_course_detail'),
    path('manage/videos/<int:video_id>/delete/', views.manage_video_delete, name='manage_video_delete'),

    path('manage/users/', views.manage_users, name='manage_users'),
    path('manage/users/new/', views.manage_user_create, name='manage_user_create'),
    path('manage/users/<int:user_id>/', views.manage_user_edit, name='manage_user_edit'),
    path('manage/users/<int:user_id>/assign/', views.manage_user_assign, name='manage_user_assign'),
    path('manage/users/<int:user_id>/force-logout/', views.manage_user_force_logout,
         name='manage_user_force_logout'),
    path('manage/courses/<int:course_id>/delete/', views.delete_course, name='delete_course'),
    path('trainer/progress/', views.trainer_progress, name='trainer_progress'),

    # JWT API (token-based auth)
    path('api/token/', views.APITokenView.as_view(), name='api_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),

]
