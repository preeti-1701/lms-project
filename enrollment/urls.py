from django.urls import path
from . import views

urlpatterns = [
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('mark-progress/<int:enrollment_id>/', views.mark_progress, name='mark_progress'),
]