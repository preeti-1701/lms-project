from django.urls import path
from .views import create_course, get_courses,assign_students

urlpatterns = [
    path('create/', create_course),
    path('list/', get_courses),
    path('assign/', assign_students),
]