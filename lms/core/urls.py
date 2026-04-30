from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_login, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('course/<int:id>/', views.course_detail, name='course_detail'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.user_logout, name='logout'),
]