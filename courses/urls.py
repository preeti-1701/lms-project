from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.course_list, name='courses'),
]