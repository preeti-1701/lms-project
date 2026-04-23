from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Course, Video
from .serializers import CourseSerializer, VideoSerializer
from accounts.permissions import IsAdminOrTrainer, IsStudent
# Create Course (Admin/Trainer only)
class CreateCourseView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]

    def post(self, request):
        data = request.data.copy()
        data['created_by'] = request.user.id

        serializer = CourseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Add Video to Course
class AddVideoView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]

    def post(self, request):
        serializer = VideoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Student View Courses
class ListCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


