from django.urls import path
from .views import (
    CategoryListView, CourseListView, CourseCreateView,
    CourseDetailView, InstructorCourseListView,
    LessonCreateView, LessonDetailView
)

urlpatterns = [
    # categories
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # courses
    path('', CourseListView.as_view(), name='course-list'),
    path('create/', CourseCreateView.as_view(), name='course-create'),
    path('my-courses/', InstructorCourseListView.as_view(), name='instructor-courses'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),

    # lessons
    path('<slug:slug>/lessons/', LessonCreateView.as_view(), name='lesson-create'),
    path('<slug:slug>/lessons/<int:id>/', LessonDetailView.as_view(), name='lesson-detail'),
]