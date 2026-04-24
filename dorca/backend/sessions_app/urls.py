from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.sessions_list),
    path('sessions/<int:session_id>/force-logout/', views.force_logout),
]
