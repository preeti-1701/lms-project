from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.courses_list),
    path('courses/<int:course_id>/', views.course_detail),
    path('courses/<int:course_id>/videos/', views.add_video),
    path('courses/<int:course_id>/assign/', views.assign_course),
    path('videos/<int:video_id>/complete/', views.mark_video_complete),
]
