from django.urls import path

from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('users/', views.user_list, name='user_list'),
    path('users/new/', views.user_form, name='user_create'),
    path('users/<int:pk>/edit/', views.user_form, name='user_edit'),
    path('users/<int:pk>/force-logout/', views.force_logout, name='force_logout'),
    path('courses/', views.course_list, name='course_list'),
    path('courses/new/', views.course_form, name='course_create'),
    path('courses/<int:pk>/', views.course_detail, name='course_detail'),
    path('courses/<int:pk>/edit/', views.course_form, name='course_edit'),
    path('lessons/new/', views.lesson_form, name='lesson_create'),
    path('lessons/<int:pk>/edit/', views.lesson_form, name='lesson_edit'),
]
