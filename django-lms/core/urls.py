from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("signup/", views.signup, name="signup"),
    path("login/", auth_views.LoginView.as_view(template_name="registration/login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),

    path("dashboard/", views.dashboard, name="dashboard"),
    path("courses/", views.my_courses, name="my_courses"),
    path("courses/<int:course_id>/", views.course_detail, name="course_detail"),

    # Management
    path("manage/courses/", views.manage_courses, name="manage_courses"),
    path("manage/courses/new/", views.course_create, name="course_create"),
    path("manage/courses/<int:course_id>/edit/", views.course_edit, name="course_edit"),
    path("manage/courses/<int:course_id>/delete/", views.course_delete, name="course_delete"),
    path("manage/courses/<int:course_id>/videos/add/", views.video_add, name="video_add"),
    path("manage/videos/<int:video_id>/delete/", views.video_delete, name="video_delete"),
    path("manage/courses/<int:course_id>/assign/", views.course_assign, name="course_assign"),
    path("manage/assignments/<int:assignment_id>/remove/", views.assignment_remove, name="assignment_remove"),

    path("manage/users/", views.manage_users, name="manage_users"),
    path("manage/users/<int:user_id>/toggle-role/", views.toggle_role, name="toggle_role"),
    path("manage/users/<int:user_id>/toggle-disabled/", views.toggle_disabled, name="toggle_disabled"),
]
