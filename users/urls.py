from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .views import RegisterView, LoginView, UserListView

urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    
    path('login/',    LoginView.as_view(),    name='login'),
    
    path('users/',    UserListView.as_view(), name='user-list'),
    
    path('schema/',   SpectacularAPIView.as_view(),    name='schema'),
    path('docs/',     SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
]