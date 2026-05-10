from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('<uuid:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('my-courses/', views.StudentCourseListView.as_view(), name='student-courses'),
    path('trainer-courses/', views.TrainerCourseListView.as_view(), name='trainer-courses'),
    path('<uuid:course_id>/videos/', views.CourseVideoListCreateView.as_view(), name='course-videos'),
    path('<uuid:course_id>/progress/', views.TrainerStudentProgressView.as_view(), name='course-progress'),
    path('assignments/', views.CourseAssignmentView.as_view(), name='assignments'),
    path('video-token/<uuid:video_id>/', views.VideoTokenView.as_view(), name='video-token'),
    path('mark-watched/<uuid:video_id>/', views.MarkVideoWatchedView.as_view(), name='mark-watched'),
]