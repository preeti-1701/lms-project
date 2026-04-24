from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Course
from .models import Video, Course
from .models import Enrollment, User
from django.contrib.auth import get_user_model
User = get_user_model()
from accounts.utils import validate_session


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    if request.user.role not in ['admin', 'trainer']:
        return Response({'error': 'Unauthorized'}, status=403)

    title = request.data.get('title')

    if not title:
        return Response({'error': 'Title required'}, status=400)

    course = Course.objects.create(
        title=title,
        created_by=request.user
    )

    return Response({'message': 'Course created'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_video(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    # ✅ Role check (Admin + Trainer only)
    if request.user.role not in ['admin', 'trainer']:
        return Response({'error': 'Unauthorized'}, status=403)

    # ✅ Get data
    course_id = request.data.get('course_id')
    title = request.data.get('title')
    description = request.data.get('description')  # ✅ NEW
    youtube_link = request.data.get('youtube_link')

    # ✅ Validate required fields
    if not course_id or not title or not youtube_link:
        return Response({'error': 'All fields required'}, status=400)

    # ✅ Validate course_id
    try:
        course_id = int(course_id)
    except ValueError:
        return Response({'error': 'Invalid course id'}, status=400)

    # ✅ Fetch course
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    # ✅ Create video
    video = Video.objects.create(
        course=course,
        title=title,
        description=description,  # ✅ SAVE DESCRIPTION
        youtube_link=youtube_link
    )

    return Response({
        'message': 'Video added successfully',
        'video': {
            'title': video.title,
            'description': video.description,
            'course': course.title
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_student(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    # ✅ Only admin can enroll
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    # ✅ Validate input
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')

    if not student_id or not course_id:
        return Response({'error': 'All fields required'}, status=400)

    try:
        student_id = int(student_id)
        course_id = int(course_id)
    except ValueError:
        return Response({'error': 'Invalid IDs'}, status=400)

    # ✅ Fetch student (ONLY student role allowed)
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)

    # ✅ Fetch course
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    # ✅ Prevent duplicate enrollment
    if Enrollment.objects.filter(student=student, course=course).exists():
        return Response({'error': 'Already enrolled'}, status=400)

    # ✅ Create enrollment
    Enrollment.objects.create(student=student, course=course)

    return Response({
        'message': 'Student enrolled successfully',
        'student': student.username,
        'course': course.title
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_courses(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    if request.user.role != 'student':
        return Response({'error': 'Unauthorized'}, status=403)

    enrollments = Enrollment.objects.filter(student=request.user)

    data = []

    for enroll in enrollments:
        course = enroll.course
        videos = Video.objects.filter(course=course)

        data.append({
            'course': course.title,
            'videos': [
                {
                    'title': v.title,
                    'description': v.description,
                    'link': v.youtube_link
                } for v in videos
            ]
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_courses(request):

    session_check = validate_session(request)
    if session_check:
        return session_check
    
    courses = Course.objects.all().values('id', 'title')
    return Response(list(courses))