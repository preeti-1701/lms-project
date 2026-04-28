from django.urls import path
from .views import list_courses, create_course, course_videos

urlpatterns = [
    path('all/', list_courses),
    path('create/', create_course),
    path('<int:course_id>/videos/', course_videos),
]