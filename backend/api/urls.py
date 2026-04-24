from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, RegisterView, UserViewSet, SessionViewSet,
    CourseViewSet, CourseVideoViewSet, NotificationViewSet,
    TicketViewSet, CourseMaterialViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'tickets', TicketViewSet, basename='ticket')

# For nested routing manually:
course_video_list = CourseVideoViewSet.as_view({'get': 'list', 'post': 'create'})
course_video_detail = CourseVideoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

course_material_list = CourseMaterialViewSet.as_view({'get': 'list', 'post': 'create'})
course_material_detail = CourseMaterialViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
    path('courses/<int:course_pk>/videos/', course_video_list, name='course-videos-list'),
    path('courses/<int:course_pk>/videos/<int:pk>/', course_video_detail, name='course-videos-detail'),
    path('courses/<int:course_pk>/materials/', course_material_list, name='course-materials-list'),
    path('courses/<int:course_pk>/materials/<int:pk>/', course_material_detail, name='course-materials-detail'),
]
