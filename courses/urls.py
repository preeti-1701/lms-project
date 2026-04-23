from django.urls import path
from .views import CreateCourseView, AddVideoView, ListCoursesView

urlpatterns = [
    path('create/', CreateCourseView.as_view()),
    path('add-video/', AddVideoView.as_view()),
    path('list/', ListCoursesView.as_view()),
]