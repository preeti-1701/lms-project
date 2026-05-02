from django.urls import path
from .views import CreateCourseView, AddVideoView, ListCoursesView, DeleteVideoView, MyCoursesView

urlpatterns = [
    path('create/', CreateCourseView.as_view()),
    path('add-video/', AddVideoView.as_view()),
    path('list/', ListCoursesView.as_view()),
    path('delete-video/<int:video_id>/', DeleteVideoView.as_view(), name='delete-video'),
    path('my-courses/',  MyCoursesView.as_view(),    name='my-courses'),
]