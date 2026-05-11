from django.urls import path
from . import views

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('<int:course_id>/', views.course_detail, name='course_detail'),
    path('add-chapter/', views.add_chapter, name='add_chapter'),
    path('delete-chapter/<int:chapter_id>/', views.delete_chapter, name='delete_chapter'),
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('enrollment-requests/', views.enrollment_requests, name='enrollment_requests'),
    path('enrollment/<int:enrollment_id>/approve/', views.approve_enrollment, name='approve_enrollment'),
    path('enrollment/<int:enrollment_id>/reject/', views.reject_enrollment, name='reject_enrollment'),
]
