from django.urls import path
from .views import all_courses, archive_course, create_course, add_video, delete_enrollment, edit_course, enroll_student, list_enrollments, mark_video_complete, student_courses, list_courses, trainer_courses

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
    path('api/edit-course/<int:course_id>/', edit_course),
    path('api/all-courses/', all_courses),
    path('api/archive-course/<int:course_id>/', archive_course),
]