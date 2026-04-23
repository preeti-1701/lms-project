"""Course REST API endpoints.

GET    /api/courses/                          list all courses
POST   /api/courses/                          create course (admin only)
GET    /api/courses/<id>/                     retrieve course
PUT    /api/courses/<id>/                     update course (admin only)
DELETE /api/courses/<id>/                     delete course (admin only)
POST   /api/courses/<id>/enroll/              enroll current user
GET    /api/courses/my/enrollments/           list current user's enrollments

GET    /api/courses/<id>/lessons/             list lessons for a course
POST   /api/courses/<id>/lessons/             add lesson (admin only)
GET    /api/courses/lessons/<id>/             retrieve lesson
PUT    /api/courses/lessons/<id>/             update lesson (admin only)
DELETE /api/courses/lessons/<id>/             delete lesson (admin only)
POST   /api/courses/lessons/<id>/complete/    mark lesson complete (toggle off
                                              with `{"completed": false}`)
"""
from django.urls import path

from . import api_views

urlpatterns = [
    # course endpoints
    path('', api_views.CourseListCreateAPIView.as_view(), name='api-course-list'),
    path('<int:pk>/', api_views.CourseDetailAPIView.as_view(), name='api-course-detail'),
    path('<int:pk>/enroll/', api_views.EnrollAPIView.as_view(), name='api-course-enroll'),
    path('my/enrollments/', api_views.MyEnrollmentsAPIView.as_view(), name='api-my-enrollments'),

    # lesson endpoints
    path('<int:course_id>/lessons/', api_views.LessonListCreateAPIView.as_view(),
         name='api-lesson-list'),
    path('lessons/<int:pk>/', api_views.LessonDetailAPIView.as_view(),
         name='api-lesson-detail'),
    path('lessons/<int:pk>/complete/', api_views.LessonCompleteAPIView.as_view(),
         name='api-lesson-complete'),
]
