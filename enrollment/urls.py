from django.urls import path
from .views import (
    EnrollView, UnenrollView, MyEnrollmentsView,
    CourseStudentsView, LessonProgressView, MyProgressView
)

urlpatterns = [
    path('enroll/<int:course_id>/', EnrollView.as_view(), name='enroll'),
    path('unenroll/<int:course_id>/', UnenrollView.as_view(), name='unenroll'),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('course/<int:course_id>/students/', CourseStudentsView.as_view(), name='course-students'),
    path('progress/<int:lesson_id>/', LessonProgressView.as_view(), name='lesson-progress'),
    path('progress/course/<int:course_id>/', MyProgressView.as_view(), name='my-progress'),
]