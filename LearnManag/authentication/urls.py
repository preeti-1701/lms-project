from django.urls import path
from .views import (
    login_view, logout_view, dashboard_view, login_page, get_students, get_trainers,
    profile_page, profile_api, register_api, register_page, 
    pending_users_api, approve_user_api, reject_user_api, approvals_page,
    all_users_api, toggle_status_api, force_logout_api, manage_users_page,
    log_violation_api, violations_api
)

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('register/', register_page),
    path('register-api/', register_api),
    path('pending/', pending_users_api),
    path('approve/<int:user_id>/', approve_user_api),
    path('reject/<int:user_id>/', reject_user_api),
    path('approvals/', approvals_page),
    path('manage-users/', manage_users_page),
    path('all-users/', all_users_api),
    path('toggle-status/<int:user_id>/', toggle_status_api),
    path('force-logout/<int:user_id>/', force_logout_api),
    path('log-violation/', log_violation_api),
    path('violations/', violations_api),
    path('dashboard/', dashboard_view),
    path('students/', get_students),
    path('trainers/', get_trainers),
    path('profile/', profile_page),
    path('profile-api/', profile_api),
    path('', login_page),
]