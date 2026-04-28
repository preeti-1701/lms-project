from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Course
from .serializers import CourseSerializer
from users.models import User
from .models import Video


class StudentCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        courses = Course.objects.filter(assigned_students=user)
        serializer = CourseSerializer(courses, many=True)

        return Response(serializer.data)

class CreateCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # 🚫 Only trainer or admin allowed
        if user.role not in ['trainer', 'admin']:
            return Response({"error": "Only trainers can create courses"}, status=403)

        serializer = CourseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(created_by=user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

class AssignStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user

        # Only trainer/admin allowed
        if user.role not in ['trainer', 'admin']:
            return Response({"error": "Not allowed"}, status=403)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        student_ids = request.data.get('student_ids', [])


        students = User.objects.filter(id__in=student_ids, role='student')

        course.assigned_students.add(*students)

        return Response({"message": "Students assigned successfully"})
    
class AddVideoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user

        if user.role not in ['trainer', 'admin']:
            return Response({"error": "Not allowed"}, status=403)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        title = request.data.get('title')
        youtube_link = request.data.get('youtube_link')

        video = Video.objects.create(
            course=course,
            title=title,
            youtube_link=youtube_link
        )

        return Response({
            "message": "Video added",
            "video_id": video.id
        })