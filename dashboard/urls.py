from django.urls import path
from .views import AdminDashboardView, TrainerDashboardView, StudentDashboardView

urlpatterns = [
    path('admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('trainer/', TrainerDashboardView.as_view(), name='trainer-dashboard'),
    path('student/', StudentDashboardView.as_view(), name='student-dashboard'),
]
