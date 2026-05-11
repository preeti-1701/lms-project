from django.urls import path
from .views import create_user, get_all_users, login_view, toggle_user_status
from .views import get_courses
from .views import get_course_videos
from .views import play_video, get_profile
from .views import create_course, enroll_student
from .views import add_video
from .views import force_logout_user
from .views import get_login_activity


urlpatterns = [
    path('login/', login_view),
    path('courses/', get_courses),
    path('courses/<int:course_id>/videos/', get_course_videos),
    path('videos/<int:video_id>/play/', play_video),
    path('profile/', get_profile),
    path('users/', get_all_users),
    path('users/create/', create_user),
    path('users/<int:user_id>/toggle/', toggle_user_status),
    path('courses/create/', create_course),
    path('enroll/', enroll_student),
    path('videos/add/', add_video),
    path('users/<int:user_id>/force-logout/', force_logout_user),
    path('activity/', get_login_activity),
]