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
