from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Course, Enrollment, Video
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status



@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)

    User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({'message': 'User created successfully'})


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user:
        return Response({'message': 'Login successful'})
    else:
        return Response({'error': 'Invalid credentials'}, status=401)


@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all()

    data = []
    for course in courses:
        data.append({
            'id': course.id,
            'title': course.title,
            'description': course.description
        })

    return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course(request):

    # DEBUG (remove later)
    print("USER:", request.user)
    print("AUTH:", request.META.get('HTTP_AUTHORIZATION'))

    if not request.user.is_staff:
        return Response({'error': 'Only admin can add course'}, status=403)

    title = request.data.get('title')
    description = request.data.get('description')

    Course.objects.create(
        title=title,
        description=description
    )

    return Response({'message': 'Course added successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_courses(request):

    enrollments = Enrollment.objects.filter(user=request.user)

    data = []
    for enrollment in enrollments:
        course = enrollment.course
        data.append({
            'id': course.id,
            'title': course.title,
            'description': course.description
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_video(request):

    course_id = request.data.get('course_id')
    youtube_link = request.data.get('youtube_link')

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    Video.objects.create(
        course=course,
        youtube_link=youtube_link
    )

    return Response({'message': 'Video added successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_videos(request, course_id):

    # Check if user is enrolled
    is_enrolled = Enrollment.objects.filter(
        user=request.user,
        course_id=course_id
    ).exists()

    if not is_enrolled:
        return Response({'error': 'You are not enrolled in this course'})

    videos = Video.objects.filter(course_id=course_id)

    data = []
    for video in videos:
        data.append({
            'id': video.id,
            'youtube_link': video.youtube_link
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    
    course_id = request.data.get('course_id')

    # Check course exists
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'})

    # Check already enrolled
    if Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({'message': 'Already enrolled'})

    # Create enrollment
    Enrollment.objects.create(user=request.user, course=course)

    return Response({'message': 'Enrolled successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):

    # Check enrollment
    is_enrolled = Enrollment.objects.filter(
        user=request.user,
        course_id=course_id
    ).exists()

    if not is_enrolled:
        return Response({'error': 'Not enrolled'})

    course = Course.objects.get(id=course_id)
    videos = Video.objects.filter(course=course)

    video_data = []
    for v in videos:
        video_data.append({
            'id': v.id,
            'youtube_link': v.youtube_link
        })

    return Response({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'videos': video_data
    })