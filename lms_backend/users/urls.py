from django.urls import path
from . import views

urlpatterns = [
    path('student/register/', views.student_register, name='student_register'),
    path('trainer/register/', views.trainer_register, name='trainer_register'),
    path('admin/register/', views.admin_register, name='admin_register'),
]
