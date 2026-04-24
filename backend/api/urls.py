from django.urls import path
from .views import *

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('courses/', CourseListCreateView.as_view(), name='courses'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('videos/', VideoListCreateView.as_view(), name='videos'),
    path('enrollments/', EnrollmentView.as_view(), name='enrollments'),
    path('my-courses/', StudentCoursesView.as_view(), name='my-courses'),
    path('sessions/', SessionListView.as_view(), name='sessions'),
    path('force-logout/<int:user_id>/', ForceLogoutView.as_view(), name='force-logout'),
    path('setup/', SetupView.as_view(), name='setup'),
]