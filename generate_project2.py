import os

files = {
    "courses/serializers.py": """
from rest_framework import serializers
from .models import Course, Video

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'
        read_only_fields = ('embed_url',)

class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'
""",
    "courses/views.py": """
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Course, Video
from .serializers import CourseSerializer, VideoSerializer
from accounts.permissions import IsAdmin, IsTrainer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Course.objects.all()
        elif user.role == 'TRAINER':
            return Course.objects.filter(created_by=user)
        else:
            # Student: show only enrolled courses
            return Course.objects.filter(enrollment__student=user, enrollment__is_active=True)

class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Video.objects.all()
        elif user.role == 'TRAINER':
            return Video.objects.filter(course__created_by=user)
        else:
            return Video.objects.filter(course__enrollment__student=user, course__enrollment__is_active=True)
""",
    "courses/urls.py": """
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, VideoViewSet

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')
router.register(r'(?P<course_id>[^/.]+)/videos', VideoViewSet, basename='course-videos')

urlpatterns = [
    path('', include(router.urls)),
]
""",
    "enrollments/serializers.py": """
from rest_framework import serializers
from .models import Enrollment, VideoProgress

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = '__all__'
""",
    "enrollments/views.py": """
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Enrollment, VideoProgress
from .serializers import EnrollmentSerializer, VideoProgressSerializer
from accounts.permissions import IsAdmin

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return Enrollment.objects.all()
        return Enrollment.objects.filter(student=self.request.user)

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

class VideoProgressViewSet(viewsets.ModelViewSet):
    serializer_class = VideoProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return VideoProgress.objects.all()
        return VideoProgress.objects.filter(enrollment__student=self.request.user)
""",
    "enrollments/urls.py": """
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet, VideoProgressViewSet

router = DefaultRouter()
router.register(r'', EnrollmentViewSet, basename='enrollment')
router.register(r'progress', VideoProgressViewSet, basename='video-progress')

urlpatterns = [
    path('', include(router.urls)),
]
""",
    "security/serializers.py": """
from rest_framework import serializers
from .models import SecurityLog

class SecurityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityLog
        fields = '__all__'
""",
    "security/views.py": """
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from .models import SecurityLog
from .serializers import SecurityLogSerializer
from accounts.models import UserSession

class SecurityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SecurityLog.objects.all()
    serializer_class = SecurityLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
""",
    "security/urls.py": """
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SecurityLogViewSet

router = DefaultRouter()
router.register(r'logs', SecurityLogViewSet, basename='security-log')

urlpatterns = [
    path('', include(router.urls)),
]
""",
    "dashboard/views.py": """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin, IsTrainer, IsStudent
from accounts.models import CustomUser, UserSession
from courses.models import Course
from enrollments.models import Enrollment

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "total_users": CustomUser.objects.count(),
            "active_sessions": UserSession.objects.filter(is_active=True).count(),
            "total_courses": Course.objects.count(),
        })

class TrainerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]

    def get(self, request):
        courses = Course.objects.filter(created_by=request.user)
        return Response({
            "my_courses_count": courses.count(),
            "enrolled_students": Enrollment.objects.filter(course__in=courses).count(),
        })

class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user, is_active=True)
        return Response({
            "enrolled_courses": enrollments.count(),
        })
""",
    "dashboard/urls.py": """
from django.urls import path
from .views import AdminDashboardView, TrainerDashboardView, StudentDashboardView

urlpatterns = [
    path('admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('trainer/', TrainerDashboardView.as_view(), name='trainer-dashboard'),
    path('student/', StudentDashboardView.as_view(), name='student-dashboard'),
]
"""
}

def main():
    base_dir = "/Users/chinnu/Desktop/NewGen softech/lms_project"
    for file_path, content in files.items():
        full_path = os.path.join(base_dir, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content.strip() + "\
")
    print("Files generated.")

if __name__ == "__main__":
    main()
