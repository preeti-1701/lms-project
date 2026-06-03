from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Admin
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/users/', views.manage_users, name='manage_users'),
    path('admin/users/<int:pk>/toggle/', views.toggle_user, name='toggle_user'),
    path('admin/courses/', views.manage_courses, name='manage_courses'),
    path('admin/courses/create/', views.create_course, name='create_course'),
    path('admin/courses/<int:pk>/edit/', views.edit_course, name='edit_course'),
    path('admin/courses/<int:pk>/delete/', views.delete_course, name='delete_course'),
    path('admin/courses/<int:course_pk>/lessons/', views.manage_lessons, name='manage_lessons'),
    path('admin/courses/<int:course_pk>/lessons/add/', views.create_lesson, name='create_lesson'),
    path('admin/lessons/<int:pk>/edit/', views.edit_lesson, name='edit_lesson'),
    path('admin/lessons/<int:pk>/delete/', views.delete_lesson, name='delete_lesson'),
    path('admin/enrollments/', views.manage_enrollments, name='manage_enrollments'),
    path('admin/enrollments/<int:pk>/remove/', views.remove_enrollment, name='remove_enrollment'),

    # Trainer
    path('trainer/', views.trainer_dashboard, name='trainer_dashboard'),
    path('trainer/course/<int:pk>/', views.trainer_course_detail, name='trainer_course_detail'),

    # Student
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('student/course/<int:pk>/', views.student_course_detail, name='student_course_detail'),
    path('student/lesson/<int:pk>/watch/', views.watch_lesson, name='watch_lesson'),
    path('student/lesson/<int:pk>/complete/', views.mark_lesson_complete, name='mark_lesson_complete'),
]
