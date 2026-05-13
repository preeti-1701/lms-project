from django.urls import path
from .views import (
    create_course, get_courses, assign_students, course_page, manage_course_view, 
    get_enrolled_students, unenroll_student, request_enrollment_api, 
    get_enrollment_requests_api, handle_enrollment_request_api,
    enrollment_requests_page, update_course_status_api
)

urlpatterns = [
    path('create/', create_course),
    path('list/', get_courses),
    path('assign/', assign_students),
    path('unenroll/', unenroll_student),
    path('enrolled/<int:course_id>/', get_enrolled_students),
    path('manage/<int:course_id>/', manage_course_view),
    path('update-status/<int:course_id>/', update_course_status_api),
    path('request-enrollment/<int:course_id>/', request_enrollment_api),
    path('enrollment-requests/', get_enrollment_requests_api),
    path('enrollment-requests-page/', enrollment_requests_page),
    path('handle-enrollment/<int:request_id>/', handle_enrollment_request_api),
    path('', course_page),
]