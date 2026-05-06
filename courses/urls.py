from django.urls import path
from .views import course_detail, student_dashboard, create_course, assign_student, add_video

urlpatterns = [
    # existing
    path('student/', student_dashboard, name='student_dashboard'),
    path('course/<int:course_id>/', course_detail, name='course_detail'),

    # NEW (add these 👇)
    path('create-course/', create_course, name='create_course'),
    path('assign-student/', assign_student, name='assign_student'),
    path('add-video/<int:course_id>/', add_video, name='add_video'),
]