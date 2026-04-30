from django.urls import path

from .views import (
    AdminApproveCourseView,
    AdminPendingCoursesView,
    AdminRejectCourseView,
    CourseDetailView,
    CourseEnrollView,
    CourseItemsView,
    CourseListCreateView,
    MyEnrollmentsView,
)


urlpatterns = [
    path('courses/', CourseListCreateView.as_view(), name='courses-list-create'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='courses-detail'),
    path('courses/<int:course_id>/items/', CourseItemsView.as_view(), name='courses-items'),
    path('courses/<int:course_id>/enroll/', CourseEnrollView.as_view(), name='courses-enroll'),
    path('me/enrollments/', MyEnrollmentsView.as_view(), name='me-enrollments'),

    path('admin/courses/pending/', AdminPendingCoursesView.as_view(), name='admin-courses-pending'),
    path('admin/courses/<int:course_id>/approve/', AdminApproveCourseView.as_view(), name='admin-courses-approve'),
    path('admin/courses/<int:course_id>/reject/', AdminRejectCourseView.as_view(), name='admin-courses-reject'),
]
