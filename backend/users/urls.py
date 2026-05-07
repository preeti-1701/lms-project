from django.urls import path

from .views import (

    login_view,

    users_list,

    create_user,

    disable_user,

    force_logout,

    delete_user
)

urlpatterns = [

    path(
        "login/",
        login_view
    ),

    path(
        "list/",
        users_list
    ),

    path(
        "create/",
        create_user
    ),

    path(
        "disable/<int:user_id>/",
        disable_user
    ),

    path(
        "logout/<int:user_id>/",
        force_logout
    ),

    path(
    "delete/<str:username>/",
        delete_user
),
]