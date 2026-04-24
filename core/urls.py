from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('trainer/', views.trainer_dashboard, name='trainer_dashboard'),
    path('admin-panel/', views.admin_panel, name='admin_panel'),
    path('course/<int:course_id>/', views.course_detail, name='course_detail'),
]