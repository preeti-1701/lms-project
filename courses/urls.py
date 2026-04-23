from django.urls import path
from .views import StudentCoursesView

urlpatterns = [
    path('my-courses/', StudentCoursesView.as_view()),
]