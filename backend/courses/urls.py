from django.urls import path

from .views import *

urlpatterns = [

    path(
        "all/",
        list_courses
    ),

    path(
        "create/",
        create_course
    ),

    path(
        "add-video/",
        add_video
    ),

    path(
        "update-video/<int:id>/",
        update_video
    ),

    path(
        "delete-video/<int:id>/",
        delete_video
    ),

    path(
        "assign/",
        assign_course
    ),

    path(
        "student/",
        student_courses
    ),

    path(
    "delete-course/<int:id>/",
    delete_course
),
]