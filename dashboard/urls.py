from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name = 'home'),
    path('admin-dashboard/', views.admin_dashboard, name = 'admin_dashboard'),
    path('trainer-dashboard/', views.trainer_dashboard, name = 'trainer_dashboard'),
]