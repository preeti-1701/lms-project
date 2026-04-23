from django.urls import path
from .views import user_login, dashboard

urlpatterns = [
    path('login/', user_login, name='login'),   # ✅ change here
    path('dashboard/', dashboard, name='dashboard'),
]