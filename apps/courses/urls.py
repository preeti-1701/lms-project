from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, VideoViewSet, EnrollmentViewSet, VideoProgressView

router = DefaultRouter(trailing_slash=True)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')
router.register(r'', CourseViewSet, basename='courses')

urlpatterns = router.urls + [
    path('<uuid:course_pk>/videos/',
         VideoViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='course-videos-list'),
    path('<uuid:course_pk>/videos/<uuid:pk>/',
         VideoViewSet.as_view({'get': 'retrieve', 'put': 'update',
                               'patch': 'partial_update', 'delete': 'destroy'}),
         name='course-videos-detail'),
    path('progress/<uuid:pk>/', VideoProgressView.as_view(), name='video-progress'),
]