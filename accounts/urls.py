from django.urls import path
from .views import LoginView, LogoutView, RegisterView, AdminOnlyView, TrainerView, StudentView, ForceLogoutView

urlpatterns= [
    path('login/',LoginView.as_view(),name='login'),
    path('logout/',LogoutView.as_view(),name='logout'),
    path('register/',RegisterView.as_view(),name='register'),
    path('admin-only/',AdminOnlyView.as_view(),name='admin-only'),
    path('trainer/', TrainerView.as_view(),name='trainer'),
    path('student/', StudentView.as_view(),name='student'),
    path('force-logout/', ForceLogoutView.as_view()),
]