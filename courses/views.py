from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Course
from .serializers import CourseSerializer
from users.models import User
from .models import Video

from django.shortcuts import render

def dashboard(request):
    return render(request, "dashboard.html")

def course_page(request, course_id):
    return render(request, "course.html")

def watch_video_page(request, course_id, video_id):
    return render(request, "watch_video.html")

def trainer_dashboard(request):
    return render(request, "trainer_dashboard.html")

def admin_dashboard(request):
    return render(request, "admin_dashboard.html")

def trainer_manage_course_page(request, course_id):
    return render(request, "trainer_manage_course.html")


class TrainerCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)

        return Response(serializer.data)

class StudentCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        courses = Course.objects.filter(assigned_students__id=user.id)
        # FIX: Pass the request context!
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

class CreateCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # 🚫 Only trainer or admin allowed
        if user.role != 'admin' and not user.is_superuser:
            return Response({"error": "Only admin can create courses"}, status=403)

        serializer = CourseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(created_by=user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

class AssignStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user

        if user.role not in ['trainer', 'admin'] and not user.is_superuser:
            return Response({"error": "Not allowed"}, status=403)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        student_ids = request.data.get('student_ids', [])
        students = User.objects.filter(id__in=student_ids, role='student')

        # USE .set() HERE INSTEAD OF .add()
        # This ensures that unchecked students are removed, and checked ones are added.
        course.assigned_students.set(students)

        return Response({"message": "Students assigned successfully"})
    
class AddVideoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user

        if user.role not in ['trainer', 'admin'] and not user.is_superuser:
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
    
class ManageVideoView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, video_id):
        user = request.user
        if user.role not in ['trainer', 'admin'] and not user.is_superuser:
            return Response({"error": "Not allowed"}, status=403)

        try:
            video = Video.objects.get(id=video_id)
        except Video.DoesNotExist:
            return Response({"error": "Video not found"}, status=404)

        video.title = request.data.get('title', video.title)
        video.youtube_link = request.data.get('youtube_link', video.youtube_link)
        video.save()

        return Response({"message": "Video updated"})

    def delete(self, request, video_id):
        user = request.user
        if user.role not in ['trainer', 'admin'] and not user.is_superuser:
            return Response({"error": "Not allowed"}, status=403)

        try:
            video = Video.objects.get(id=video_id)
            video.delete()
            return Response({"message": "Video deleted"})
        except Video.DoesNotExist:
            return Response({"error": "Video not found"}, status=404)
        
class MarkVideoCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, video_id):
        from .models import Video, VideoProgress
        try:
            video = Video.objects.get(id=video_id)
            VideoProgress.objects.get_or_create(user=request.user, video=video, defaults={'is_completed': True})
            return Response({"message": "Marked as complete"})
        except Video.DoesNotExist:
            return Response({"error": "Video not found"}, status=404)