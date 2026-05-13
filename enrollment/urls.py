# enrollment/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Student Enrollment
    path(
        'enroll/<int:course_id>/',
        views.enroll_course,
        name='enroll_course'
    ),
    
    # Update Progress (Recommended for YouTube player integration)
    path(
        'update-progress/<int:enrollment_id>/',
        views.update_progress,
        name='update_progress'
    ),
    
    # Optional: Keep for manual completion (Recommended to keep)
    path(
        'mark-progress/<int:enrollment_id>/',
        views.mark_progress,
        name='mark_progress'
    ),
]