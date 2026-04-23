from django.urls import path
from .views import VideoCreateView, VideoDetailView

urlpatterns = [
    path('lesson/<int:lesson_id>/', VideoCreateView.as_view(), name='video-create'),
    path('<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
]