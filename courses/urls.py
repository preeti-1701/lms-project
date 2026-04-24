from django.urls import path
from .views import create_course, add_video, enroll_student, mark_video_complete, student_courses, list_courses

urlpatterns = [
    path('api/create-course/', create_course),
    path('api/add-video/', add_video),
    path('api/enroll/', enroll_student),
    path('api/student-courses/', student_courses),
    path('api/courses/', list_courses),
    path('api/mark-complete/', mark_video_complete),
]