from django.urls import path
from .views import create_course, add_video, delete_enrollment, enroll_student, list_enrollments, mark_video_complete, student_courses, list_courses, trainer_courses

urlpatterns = [
    path('api/create-course/', create_course),
    path('api/add-video/', add_video),
    path('api/enroll/', enroll_student),
    path('api/student-courses/', student_courses),
    path('api/courses/', list_courses),
    path('api/mark-complete/', mark_video_complete),
    path('api/enrollments/', list_enrollments),
    path('api/enrollment/<int:enrollment_id>/', delete_enrollment),
    path('api/trainer-courses/', trainer_courses),
]