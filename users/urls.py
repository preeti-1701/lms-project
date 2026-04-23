from django.urls import path
from .views import login_view, dashboard
from .views import add_course
from .views import view_courses
from .views import enroll
from .views import my_courses

urlpatterns = [
    path('login/', login_view, name='login'),
    path('dashboard/', dashboard, name='dashboard'),
    path('add-course/',add_course),
    path('courses/',view_courses),
    path('enroll/',enroll),
    path('my-courses/',my_courses),
]