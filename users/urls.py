from django.urls import path
from .views import login_view, dashboard
from .views import add_course
from .views import view_courses
from .views import enroll
from .views import my_courses
from .views import course_videos
from .views import logout_view
from . import views

urlpatterns = [
    path('login/', login_view, name='login'),
    path('dashboard/', dashboard, name='dashboard'),
    path('add-course/',add_course),
    path('courses/',view_courses),
    path('enroll/',enroll),
    path('my-courses/',my_courses),
    path('logout/', logout_view, name='logout'),
    path('trainer/', views.trainer_dashboard, name='trainer_dashboard'),
    path('trainer/course/<int:id>/', views.trainer_course, name='trainer_course'),
    path('accounts/login/', login_view),
    path('certificate/<int:course_id>/', views.generate_certificate),
    path('course/<int:course_id>/', views.course_videos,name='course_videos'),
    path('admin-dashboard/', views.admin_dashboard),
    path('update-progress/<int:course_id>/<int:video_id>/', views.update_progress),
    path('delete-course/<int:id>/', views.delete_course),
    path('delete-user/<int:id>/', views.delete_user),
]