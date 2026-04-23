from django.urls import path
from .views import student_courses, course_detail

urlpatterns = [
    path('', student_courses, name='student_courses'),
    path('<int:id>/', course_detail, name='course_detail'),
]