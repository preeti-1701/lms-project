from django.urls import path
from . import views

urlpatterns = [
    path('create-course/', views.create_course, name='create_course'),
    path('add-video/', views.add_video, name='add_video'),
    path('manage-students/', views.manage_students, name='manage_students'),
    path('complete/<int:video_id>/', views.mark_complete, name='mark_complete'),
    path('create-quiz/', views.create_quiz, name='create_quiz'),
    path('question-count/', views.question_count, name='question_count'),
    path('add-question/', views.add_question, name='add_question'),

    #path('quiz/<int:course_id>/', views.take_quiz, name='take_quiz'),
    path('quiz/<int:quiz_id>/', views.take_quiz, name='take_quiz'),
    path('my-courses/', views.student_courses, name='student_courses'),
    path('course/<int:course_id>/', views.course_videos, name='course_videos'),
    path('profile/', views.profile, name='course_profile'),
    path('all/', views.all_courses, name='all_courses'),
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('quiz-courses/', views.quiz_courses, name='quiz_courses'),
    path('start-quiz/<int:course_id>/', views.start_quiz, name='start_quiz'),
]