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
    path('course/<int:course_id>/enroll/', views.enroll_course, name='enroll_course'),
    path('course/<int:course_id>/watch/<int:video_id>/', views.watch_video, name='watch_video'),
    path('api/video/<int:video_id>/complete/', views.mark_video_completed, name='mark_video_completed'),
    path('course/<int:course_id>/quiz/', views.take_quiz, name='take_quiz'),
    path('course/<int:course_id>/certificate/', views.download_certificate, name='certificate'),
]