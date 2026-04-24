from django.urls import path
from .views import add_video, get_videos

urlpatterns = [
    path('add/', add_video),
    path('<int:course_id>/', get_videos),
]