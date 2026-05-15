# dashboard/urls.py
from django.urls import path
from . import views

app_name = 'dashboard'      # ← This must exist!

urlpatterns = [
    path('', views.home, name='home'),
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('trainer/', views.trainer_dashboard, name='trainer_dashboard'),
    path(
        'trainer/courses/<int:course_id>/enrollments/',
        views.course_enrollments,
        name='course_enrollments',
    ),
]
