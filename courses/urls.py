from django.urls import path
from .views import create_course, add_video, enroll_student, student_courses, list_courses

urlpatterns = [
    path('api/create-course/', create_course),
    path('api/add-video/', add_video),
    path('api/enroll/', enroll_student),
    path('api/student-courses/', student_courses),
    path('api/courses/', list_courses),
]