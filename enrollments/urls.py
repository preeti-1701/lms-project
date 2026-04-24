from django.urls import path
from .views import AssignCourseView, MyCoursesView

urlpatterns = [
    path('assign/', AssignCourseView.as_view()),
    path('my-courses/', MyCoursesView.as_view()),
]