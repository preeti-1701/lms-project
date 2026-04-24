from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),

    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('trainer-dashboard/', views.trainer_dashboard, name='trainer_dashboard'),
    path('student-dashboard/', views.student_dashboard, name='student_dashboard'),

    # 👉 ADD THIS LINE HERE
    path('course/<int:id>/', views.course_detail, name='course_detail'),
]