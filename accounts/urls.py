from django.urls import path
from .views import active_sessions, admin_stats, create_user, disable_user, edit_user, enable_user, login_api, list_students, force_logout, student_stats, trainer_stats

urlpatterns = [ 
    path('api/create-user/', create_user),
    path('api/login/', login_api),
    path('api/students/', list_students),
    path('api/force-logout/', force_logout),
    path('api/disable-user/', disable_user),
    path('api/enable-user/', enable_user),
    path('api/edit-user/', edit_user),
    path('api/active-sessions/', active_sessions),
    path('api/admin-stats/', admin_stats),
    path('api/trainer-stats/', trainer_stats),
    path('api/student-stats/', student_stats),
]