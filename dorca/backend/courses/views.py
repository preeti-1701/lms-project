from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Course, CourseVideo, CourseAssignment, VideoProgress
from .serializers import CourseSerializer, CreateCourseSerializer, CourseVideoSerializer, AssignCourseSerializer
from accounts.models import UserRole


def get_role(user):
    try:
        return user.user_role.role
    except UserRole.DoesNotExist:
        return 'student'


@api_view(['GET', 'POST'])
def courses_list(request):
    role = get_role(request.user)

    if request.method == 'GET':
        if role == 'student':
            assigned_ids = CourseAssignment.objects.filter(
                user=request.user
            ).values_list('course_id', flat=True)
            courses = Course.objects.filter(id__in=assigned_ids)
        elif role == 'trainer':
            courses = Course.objects.filter(trainer=request.user)
        else:
            courses = Course.objects.all()

        serializer = CourseSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    if request.method == 'POST':
        if role not in ('admin', 'trainer'):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        ser = CreateCourseSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        trainer_id = d.get('trainer_id')
        if role == 'trainer':
            trainer_id = request.user.id

        course = Course.objects.create(
            title=d['title'],
            description=d.get('description', ''),
            thumbnail=d.get('thumbnail', ''),
            category=d.get('category', ''),
            trainer_id=trainer_id,
        )

        for v in d.get('videos', []):
            CourseVideo.objects.create(
                course=course,
                title=v['title'],
                youtube_id=v['youtube_id'],
                duration=v.get('duration', ''),
                sort_order=v.get('sort_order', 0),
            )

        return Response(CourseSerializer(course, context={'request': request}).data,
                       status=status.HTTP_201_CREATED)


@api_view(['GET'])
def course_detail(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    data = CourseSerializer(course, context={'request': request}).data

    # Add progress map for students
    role = get_role(request.user)
    if role == 'student':
        progress_qs = VideoProgress.objects.filter(
            user=request.user,
            video__course=course,
            completed=True
        ).values_list('video_id', flat=True)
        data['progressMap'] = {str(vid): True for vid in progress_qs}
    else:
        data['progressMap'] = {}

    return Response(data)


@api_view(['POST'])
def add_video(request, course_id):
    role = get_role(request.user)
    if role not in ('admin', 'trainer'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    ser = CourseVideoSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    ser.save(course=course)
    return Response(ser.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def assign_course(request, course_id):
    role = get_role(request.user)
    if role != 'admin':
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    ser = AssignCourseSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    CourseAssignment.objects.get_or_create(
        user_id=ser.validated_data['user_id'],
        course_id=course_id,
    )
    return Response({'message': 'Assigned'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def mark_video_complete(request, video_id):
    VideoProgress.objects.update_or_create(
        user=request.user,
        video_id=video_id,
        defaults={'completed': True},
    )
    return Response({'message': 'Marked complete'})
