from django.urls import path
from .views import login_view, dashboard
from .views import add_course
from .views import view_courses
from .views import enroll
from .views import my_courses
from .views import course_videos
from .views import logout_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('dashboard/', dashboard, name='dashboard'),
    path('add-course/',add_course),
    path('courses/',view_courses),
    path('enroll/',enroll),
    path('my-courses/',my_courses),
    path('course/<int:course_id>/', course_videos, name='course_videos'),
    path('logout/', logout_view, name='logout'),
]