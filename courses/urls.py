from django.urls import path
from . import views
from . import api
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Web views
    path('', views.course_list, name='course_list'),
    path('create/', views.create_course, name='create_course'),
    path('<int:course_id>/', views.course_detail, name='course_detail'),
    path('<int:course_id>/add-video/', views.add_video, name='add_video'),
    path('<int:course_id>/assign/', views.assign_students, name='assign_students'),
    path('<int:course_id>/discuss/', views.discussion_list, name='discussion_list'),
    path('<int:course_id>/discuss/new/', views.create_discussion, name='create_discussion'),
    path('discuss/<int:discussion_id>/', views.discussion_detail, name='discussion_detail'),
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
    path('search/', views.search_courses, name='search_courses'),

    # 🔑 JWT Auth API
    path('api/token/', TokenObtainPairView.as_view(), name='api_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),

    # 📱 REST API endpoints
    path('api/courses/', api.CourseListAPI.as_view(), name='api_courses'),
    path('api/courses/<int:course_id>/', api.CourseDetailAPI.as_view(), name='api_course_detail'),
    path('api/progress/', api.StudentProgressAPI.as_view(), name='api_progress'),
    path('api/certificates/', api.CertificateListAPI.as_view(), name='api_certificates'),
    path('api/profile/', api.UserProfileAPI.as_view(), name='api_profile'),
]