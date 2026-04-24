from django.urls import path
from .views import create_user, login_api, list_students, force_logout

urlpatterns = [ 
    path('api/create-user/', create_user),
    path('api/login/', login_api),
    path('api/students/', list_students),
    path('api/force-logout/', force_logout),
]