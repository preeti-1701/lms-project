from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import jwt
import time
from django.conf import settings

from .models import Course, CourseVideo, CourseAssignment, VideoProgress
from .serializers import (
    CourseSerializer, CourseVideoSerializer,
    CourseAssignmentSerializer, VideoProgressSerializer,
    StudentProgressSerializer
)
from accounts.models import CustomUser
from accounts.permissions import IsAdmin, IsAdminOrTrainer
from audit.utils import log_event


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(is_active=True).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]
    serializer_class = CourseSerializer
    queryset = Course.objects.all()


class StudentCourseListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        assigned = CourseAssignment.objects.filter(
            student=self.request.user
        ).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=assigned, is_active=True)


class CourseVideoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrTrainer]
    serializer_class = CourseVideoSerializer

    def get_queryset(self):
        return CourseVideo.objects.filter(
            course_id=self.kwargs['course_id']
        )

    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        serializer.save(course=course)


class CourseAssignmentView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = CourseAssignmentSerializer

    def get_queryset(self):
        return CourseAssignment.objects.all()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


class VideoTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, video_id):
        video = get_object_or_404(CourseVideo, id=video_id)

        if request.user.role == 'student':
            is_assigned = CourseAssignment.objects.filter(
                student=request.user,
                course=video.course
            ).exists()
            if not is_assigned:
                return Response(
                    {'error': 'You are not assigned to this course'},
                    status=status.HTTP_403_FORBIDDEN
                )

        payload = {
            'video_id': str(video.youtube_video_id),
            'user_id': str(request.user.id),
            'exp': time.time() + 600,
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        log_event(
            request.user,
            'VIDEO_ACCESS',
            request,
            metadata={'video_id': str(video.id), 'course_id': str(video.course.id)}
        )

        return Response({'token': token, 'title': video.title})


class MarkVideoWatchedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, video_id):
        video = get_object_or_404(CourseVideo, id=video_id)

        is_assigned = CourseAssignment.objects.filter(
            student=request.user,
            course=video.course
        ).exists()

        if not is_assigned:
            return Response(
                {'error': 'Not assigned to this course'},
                status=status.HTTP_403_FORBIDDEN
            )

        progress, created = VideoProgress.objects.get_or_create(
            student=request.user,
            video=video,
            defaults={'watched': True}
        )

        if not progress.watched:
            progress.watched = True
            progress.save()

        return Response({'message': 'Video marked as watched'})


class TrainerCourseListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(
            trainer=self.request.user,
            is_active=True
        )


class TrainerStudentProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        if request.user.role == 'trainer' and course.trainer != request.user:
            return Response(
                {'error': 'Not your course'},
                status=status.HTTP_403_FORBIDDEN
            )

        assignments = CourseAssignment.objects.filter(
            course=course
        ).select_related('student')

        total_videos = CourseVideo.objects.filter(course=course).count()
        videos = CourseVideo.objects.filter(course=course)

        result = []
        for assignment in assignments:
            student = assignment.student
            watched_count = VideoProgress.objects.filter(
                student=student,
                video__course=course,
                watched=True
            ).count()

            percentage = (watched_count / total_videos * 100) if total_videos > 0 else 0

            video_list = []
            for video in videos:
                watched = VideoProgress.objects.filter(
                    student=student,
                    video=video,
                    watched=True
                ).exists()
                video_list.append({
                    'id': str(video.id),
                    'title': video.title,
                    'order': video.order,
                    'watched': watched
                })

            result.append({
                'student_id': str(student.id),
                'student_name': student.full_name,
                'student_email': student.email,
                'total_videos': total_videos,
                'watched_videos': watched_count,
                'percentage': round(percentage, 1),
                'videos': video_list
            })

        return Response(result)