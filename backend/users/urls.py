from django.urls import path

from .views import (
	AdminUsersView,
    ApproveTrainerView,
    LoginView,
    LogoutView,
    MeView,
    PendingTrainersView,
    PromoteAdminView,
    RefreshView,
    SignupView,
)


urlpatterns = [
	path('auth/signup/', SignupView.as_view(), name='auth-signup'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
	path('admin/trainers/pending/', PendingTrainersView.as_view(), name='admin-trainers-pending'),
	path('admin/trainers/approve/', ApproveTrainerView.as_view(), name='admin-trainers-approve'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users-list'),
	path('admin/users/promote-admin/', PromoteAdminView.as_view(), name='admin-users-promote-admin'),
]
