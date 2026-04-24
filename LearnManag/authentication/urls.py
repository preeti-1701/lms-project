from django.urls import path
from .views import login_view, logout_view,dashboard_view,login_page

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('dashboard/', dashboard_view),
    path('', login_page),
]