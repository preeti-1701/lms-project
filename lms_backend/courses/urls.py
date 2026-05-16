from django.urls import path
from . import views

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('<int:course_id>/', views.course_detail, name='course_detail'),
    path('add-chapter/', views.add_chapter, name='add_chapter'),
    path('update-chapter/<int:chapter_id>/', views.update_chapter, name='update_chapter'),
    path('delete-chapter/<int:chapter_id>/', views.delete_chapter, name='delete_chapter'),
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('enrollment-requests/', views.enrollment_requests, name='enrollment_requests'),
    path('enrollment/<int:enrollment_id>/approve/', views.approve_enrollment, name='approve_enrollment'),
    path('enrollment/<int:enrollment_id>/reject/', views.reject_enrollment, name='reject_enrollment'),
    path('admin/create/', views.admin_create_course, name='admin_create_course'),
    path('admin/<int:course_id>/update/', views.admin_update_course, name='admin_update_course'),
    path('admin/<int:course_id>/delete/', views.admin_delete_course, name='admin_delete_course'),
    path('admin/assign/', views.admin_assign_course, name='admin_assign_course'),
]
