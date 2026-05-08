from django.urls import path
from .views import ManageVideoView, MarkVideoCompleteView, StudentCoursesView, TrainerCoursesView, trainer_dashboard
from .views import CreateCourseView
from .views import AssignStudentsView
from .views import AddVideoView

urlpatterns = [
    path('my-courses/', StudentCoursesView.as_view()),
    path('create-course/', CreateCourseView.as_view()), 
    path('assign-students/<int:course_id>/', AssignStudentsView.as_view()),
    path('add-video/<int:course_id>/', AddVideoView.as_view()),
    path('manage-video/<int:video_id>/', ManageVideoView.as_view()),
    path('trainer-courses/', TrainerCoursesView.as_view()),
    path('mark-complete/<int:video_id>/', MarkVideoCompleteView.as_view()),
]