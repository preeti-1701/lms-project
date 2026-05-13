# dashboard/urls.py
from django.urls import path
from . import views

app_name = 'dashboard'      # ← This must exist!

urlpatterns = [
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('trainer/', views.trainer_dashboard, name='trainer_dashboard'),
]