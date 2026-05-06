from django.urls import path
from .views import create_course, get_courses, assign_students, course_page, manage_course_view, get_enrolled_students, unenroll_student

urlpatterns = [
    path('create/', create_course),
    path('list/', get_courses),
    path('assign/', assign_students),
    path('unenroll/', unenroll_student),
    path('enrolled/<int:course_id>/', get_enrolled_students),
    path('manage/<int:course_id>/', manage_course_view),
    path('', course_page),
]