from django.urls import path
from . import views

urlpatterns = [
    path('play/<int:video_id>/', views.play_video, name='play_video'),
]