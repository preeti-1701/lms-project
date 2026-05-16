from django.urls import path
from . import views

urlpatterns = [
    path('student/register/', views.student_register, name='student_register'),
    path('trainer/register/', views.trainer_register, name='trainer_register'),
    path('admin/register/', views.admin_register, name='admin_register'),
    path('student/login/', views.student_login, name='student_login'),
    path('trainer/login/', views.trainer_login, name='trainer_login'),
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/students/', views.admin_students, name='admin_students'),
    path('admin/trainers/', views.admin_trainers, name='admin_trainers'),
    path('admin/sessions/', views.admin_sessions, name='admin_sessions'),
    path('admin/sessions/<int:session_id>/logout/', views.admin_force_logout, name='admin_force_logout'),
    path('admin/user/<int:user_id>/update/', views.admin_update_user, name='admin_update_user'),
    path('admin/user/<int:user_id>/toggle-status/', views.admin_toggle_user_status, name='admin_toggle_user_status'),
]
