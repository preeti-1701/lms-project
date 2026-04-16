from django.urls import path
from . import views

urlpatterns = [
    path('my-courses/', views.student_courses, name='student_courses'),
]