from django.urls import path
from .views import active_sessions, create_user, disable_user, edit_user, enable_user, login_api, list_students, force_logout

urlpatterns = [ 
    path('api/create-user/', create_user),
    path('api/login/', login_api),
    path('api/students/', list_students),
    path('api/force-logout/', force_logout),
    path('api/disable-user/', disable_user),
    path('api/enable-user/', enable_user),
    path('api/edit-user/', edit_user),
    path('api/active-sessions/', active_sessions),
]