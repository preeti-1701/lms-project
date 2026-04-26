from django.urls import path
from .views import MySessionsView, AllSessionsView, force_logout_user, terminate_session

urlpatterns = [
    path('', AllSessionsView.as_view(), name='all-sessions'),
    path('my/', MySessionsView.as_view(), name='my-sessions'),
    path('force-logout/<uuid:user_id>/', force_logout_user, name='force-logout-user'),
    path('<uuid:session_id>/terminate/', terminate_session, name='terminate-session'),
]
