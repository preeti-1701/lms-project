from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('me/', views.me_view),
    path('users/', views.users_list),
    path('users/create/', views.create_user),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status),
]
