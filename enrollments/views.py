from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Enrollment
from .serializers import EnrollmentSerializer
from accounts.permissions import IsAdminOrTrainer


# Assign course to student
class AssignCourseView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]

    def post(self, request):
        data = request.data.copy()
        data['assigned_by'] = request.user.id

        serializer = EnrollmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# Student sees only assigned courses
class MyCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)