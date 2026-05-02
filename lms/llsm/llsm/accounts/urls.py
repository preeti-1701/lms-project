from django.urls import path
from .views import dashboard, user_login, user_logout

urlpatterns = [
    path('login/', user_login, name='login'),   # ✅ change here
    path('logout/', user_logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
]