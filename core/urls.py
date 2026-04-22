from django.urls import path

from . import views

urlpatterns = [
    path("api/auth/login/", views.api_login, name="api_login"),
    path("api/auth/logout/", views.api_logout, name="api_logout"),
    path("api/me/", views.api_me, name="api_me"),
    path("api/dashboard/", views.api_dashboard, name="api_dashboard"),
    path("api/courses/", views.api_course_create, name="api_course_create"),
    path("api/courses/<int:course_id>/", views.api_course_detail, name="api_course_detail"),
    path("api/courses/<int:course_id>/enroll/", views.api_enroll_students, name="api_enroll_students"),
    path("api/students/", views.api_students, name="api_students"),
    path("api/users/", views.api_users, name="api_users"),
    path("api/users/create/", views.api_user_create, name="api_user_create"),
    path("api/users/<int:user_id>/", views.api_user_delete, name="api_user_delete"),
    path("api/users/<int:user_id>/update/", views.api_user_update, name="api_user_update"),
    path("api/sessions/", views.api_sessions, name="api_sessions"),
    path("api/sessions/force-logout/<int:user_id>/", views.api_force_logout, name="api_force_logout"),
    path("api/courses/<int:course_id>/videos/<int:video_id>/watch-link/", views.api_student_watch_link, name="api_student_watch_link"),
    path("watch/<int:course_id>/<int:video_id>/", views.watch_redirect, name="watch_redirect"),
    path("", views.dashboard, name="dashboard"),
    path("courses/create/", views.course_create, name="course_create"),
    path("courses/<int:course_id>/", views.course_detail, name="course_detail"),
    path("courses/<int:course_id>/videos/add/", views.video_add, name="video_add"),
    path("courses/<int:course_id>/videos/<int:video_id>/watch/", views.video_watch, name="video_watch"),
    path("courses/<int:course_id>/enroll/", views.enrollment_add, name="enrollment_add"),
    path("users/", views.manage_users, name="manage_users"),
    path("users/create/", views.user_create, name="user_create"),
    path("users/<int:user_id>/edit/", views.user_edit, name="user_edit"),
    path("users/<int:user_id>/delete/", views.user_delete, name="user_delete"),
    path("sessions/", views.user_sessions, name="user_sessions"),
    path("sessions/force-logout/<int:user_id>/", views.force_logout, name="force_logout"),
]
