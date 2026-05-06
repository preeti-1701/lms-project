from django.urls import path
from .views import add_video, get_videos, reorder_videos

urlpatterns = [
    path('add/', add_video),
    path('reorder/', reorder_videos),
    path('<int:course_id>/', get_videos),
]