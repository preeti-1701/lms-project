from django.urls import path
from . import views

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('create/', views.create_course, name='create_course'),
    path('<int:course_id>/', views.course_detail, name='course_detail'),
    path('<int:course_id>/add-video/', views.add_video, name='add_video'),
    path('<int:course_id>/assign/', views.assign_students, name='assign_students'),
    path('video/<int:video_id>/watch/', views.watch_video, name='watch_video'),
    path('video/<int:video_id>/progress/', views.update_progress, name='update_progress'),
    path('video/<int:video_id>/quiz/', views.take_quiz, name='take_quiz'),
    path('video/<int:video_id>/quiz/result/', views.quiz_result, name='quiz_result'),
    path('video/<int:video_id>/create-quiz/', views.create_quiz, name='create_quiz'),
    path('certificate/<int:course_id>/', views.view_certificate, name='view_certificate'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('analytics/', views.analytics, name='analytics'),
    path('notifications/', views.notifications_view, name='notifications'),
    path('notifications/unread/', views.unread_notifications, name='unread_notifications'),
]