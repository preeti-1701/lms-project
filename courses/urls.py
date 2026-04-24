from django.urls import path
from . import views

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('course/<int:course_id>/', views.course_detail, name='course_detail'),
    path('course/<int:course_id>/enroll/', views.enroll_course, name='enroll_course'),
    # ADD THIS:
    path('my-courses/', views.my_courses, name='my_courses'),
    path('lesson/<int:lesson_id>/complete/', views.complete_lesson, name='complete_lesson'),

]