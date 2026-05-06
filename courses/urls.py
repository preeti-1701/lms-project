from django.urls import path
from .views import (
    register,
    get_courses,
    add_course,
    enroll_course,
    get_my_courses,
    add_video,
    course_detail,
    mark_video_complete,
    get_user,
    generate_certificate
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    # AUTH
    path('register/', register),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('user/', get_user),

    # COURSES
    path('courses/', get_courses),
    path('add-course/', add_course),

    # ENROLLMENT
    path('enroll/', enroll_course),
    path('my-courses/', get_my_courses),

    # VIDEOS
    path('add-video/', add_video),
    path('course/<int:course_id>/', course_detail),
    path('mark-complete/', mark_video_complete),

    # CERTIFICATE
    path('certificate/<int:course_id>/', generate_certificate),

]