from django.urls import path
from .views import StudentCoursesView
from .views import CreateCourseView
from .views import AssignStudentsView
from .views import AddVideoView

urlpatterns = [
    path('my-courses/', StudentCoursesView.as_view()),
    path('create-course/', CreateCourseView.as_view()), 
    path('assign-students/<int:course_id>/', AssignStudentsView.as_view()),
    path('add-video/<int:course_id>/', AddVideoView.as_view()),
]