from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('', views.login_view, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Main
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('profile/', views.profile_view, name='profile'),

    # Courses
    path('courses/', views.course_list_view, name='course_list'),
    path('courses/<int:pk>/', views.course_detail_view, name='course_detail'),
    path('courses/<int:pk>/enroll/', views.enroll_view, name='enroll'),
    path('courses/<int:course_pk>/lessons/<int:lesson_pk>/', views.lesson_view, name='lesson'),

    # Instructor
    path('courses/create/', views.create_course_view, name='create_course'),
    path('courses/<int:pk>/manage/', views.manage_course_view, name='manage_course'),
    path('courses/<int:pk>/edit/', views.edit_course_view, name='edit_course'),
    path('lessons/<int:pk>/delete/', views.delete_lesson_view, name='delete_lesson'),
]
