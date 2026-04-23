from django.urls import path
from .views import home, signup, user_login, user_logout, dashboard
from .views import profile
from .views import view_sessions, force_logout
from . import views
 

urlpatterns = [
    path('', home, name='home'),
    path('signup/', signup, name='signup'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
    path('profile/', profile, name='user_profile'),
]



urlpatterns += [
    path('sessions/', view_sessions, name='sessions'),
    path('logout-user/<str:session_key>/', force_logout, name='force_logout'),
]




urlpatterns += [
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('reset-password/', views.reset_password, name='reset_password'),
]