from django.urls import path
from .views import (
    RegisterView, 
    CustomLoginView, 
    logout_view,
    AdminDashboardView,
    TrainerDashboardView,
    StudentDashboardView,
    TrainerRegistrationView,
    UserListView,
    ManageCourseVideosView,
    StudentCourseDetailView,
    AdminCourseVideosView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("logout/", logout_view, name="logout"),
    
    # Dashboards
    path("dashboard/admin/", AdminDashboardView.as_view(), name="admin_dashboard"),
    path("dashboard/admin/course/<int:course_id>/videos/", AdminCourseVideosView.as_view(), name="admin_course_videos"),
    path("dashboard/trainer/", TrainerDashboardView.as_view(), name="trainer_dashboard"),
    path("dashboard/trainer/course/<int:course_id>/videos/", ManageCourseVideosView.as_view(), name="manage_course_videos"),
    path("dashboard/student/", StudentDashboardView.as_view(), name="student_dashboard"),
    path("dashboard/student/course/<int:course_id>/", StudentCourseDetailView.as_view(), name="student_course_detail"),
    
    # Admin Actions
    path("admin/register-trainer/", TrainerRegistrationView.as_view(), name="trainer_register"),
    path("admin/users/", UserListView.as_view(), name="user_list"),
]
