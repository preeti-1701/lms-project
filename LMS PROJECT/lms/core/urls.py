from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('logout/', views.logout_view, name='logout'),

    path('course/<int:course_id>/', views.course_detail, name='course_detail'),

    # 🔥 IMPORTANT (AUTO PROGRESS)
    path('progress/<int:course_id>/', views.update_progress, name='update_progress'),
    path('certificate/<int:course_id>/', views.generate_certificate, name='certificate'),
    path('profile/', views.profile, name='profile'),
]