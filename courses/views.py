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
    

class DeleteVideoView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]
 
    def delete(self, request, video_id):
        try:
            video = Video.objects.get(id=video_id)
        except Video.DoesNotExist:
            return Response({"detail": "Video not found."}, status=404)
 
        # Trainers can only delete videos from courses they created
        if request.user.role == 'trainer' and video.course.created_by != request.user:
            return Response({"detail": "You do not have permission to delete this video."}, status=403)
 
        video.delete()
        return Response({"message": "Video deleted successfully."}, status=200)
 
class MyCoursesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]
 
    def get(self, request):
        # Admins see all courses; trainers see only their own
        if request.user.role == 'admin':
            courses = Course.objects.all()
        else:
            courses = Course.objects.filter(created_by=request.user)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
