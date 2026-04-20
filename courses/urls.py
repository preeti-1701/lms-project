from django.urls import path
from .views import register, login, get_courses, add_course, get_my_courses, add_video, get_videos

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('courses/', get_courses),
    path('courses/add/', add_course),
    path('my-courses/', get_my_courses),
    path('videos/add/', add_video),
    path('videos/<int:course_id>/', get_videos),
]