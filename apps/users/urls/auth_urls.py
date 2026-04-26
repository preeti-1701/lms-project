from django.urls import path
from apps.users.views import LoginView, LogoutView, TokenRefreshWithValidationView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshWithValidationView.as_view(), name='token-refresh'),
]
