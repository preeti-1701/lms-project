from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('', views.dashboard_view, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # Admin
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('manage-users/', views.manage_users, name='manage_users'),
    path('users/create/', views.create_user, name='create_user'),
    path('users/edit/<int:user_id>/', views.edit_user, name='edit_user'),
    path('users/delete/<int:user_id>/', views.delete_user, name='delete_user'),
    path('courses/create/', views.create_course, name='create_course'),
    path('courses/edit/<str:course_id>/', views.edit_course, name='edit_course'),
    path('courses/delete/<str:course_id>/', views.delete_course, name='delete_course'),
    path('courses/<str:course_id>/lessons/add/', views.add_lesson, name='add_lesson'),
    path('lessons/edit/<int:lesson_id>/', views.edit_lesson, name='edit_lesson'),
    path('lessons/delete/<int:lesson_id>/', views.delete_lesson, name='delete_lesson'),
    path('enrollments/', views.view_enrollments, name='view_enrollments'),

    # Trainer
    path('trainer-dashboard/', views.trainer_dashboard, name='trainer_dashboard'),
    path('trainer/courses/<str:course_id>/lessons/add/', views.trainer_add_lesson, name='trainer_add_lesson'),
    path('trainer/lessons/edit/<int:lesson_id>/', views.trainer_edit_lesson, name='trainer_edit_lesson'),

    # Student
    path('student-dashboard/', views.student_dashboard, name='student_dashboard'),
    path('courses/<str:course_id>/enroll/', views.enroll_course, name='enroll_course'),

    # Shared
    path('courses/', views.course_list, name='course_list'),
    path('courses/<str:course_id>/', views.course_detail, name='course_detail'),
    path('lessons/<int:lesson_id>/watch/', views.video_player, name='video_player'),
]

