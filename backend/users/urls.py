from django.urls import path
from .views import login_view, users_list

urlpatterns = [
    path('login/', login_view),
    path('all/', users_list),
]