from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from .models import Course, Enrollment, Video
from django.contrib.auth import login as auth_login
import json


@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return JsonResponse({'message': 'User created successfully'})
    
    return JsonResponse({'error': 'Invalid request'})


@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            auth_login(request, user) 
            return JsonResponse({'message': 'Login successful'})
        else:
            return JsonResponse({'error': 'Invalid credentials'})
    
    return JsonResponse({'error': 'Invalid request'})


def get_courses(request):
    if request.method == 'GET':
        courses = Course.objects.all()

        data = []
        for course in courses:
            data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description
            })

        return JsonResponse(data, safe=False)
    
    return JsonResponse({'error': 'Invalid request'})

@csrf_exempt
def add_course(request):
    if request.method == 'POST':

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Login required'})

        if not request.user.is_staff:
            return JsonResponse({'error': 'Only admin can add course'})

        data = json.loads(request.body)

        title = data.get('title')
        description = data.get('description')

        Course.objects.create(
            title=title,
            description=description
        )

        return JsonResponse({'message': 'Course added successfully'})
    
    return JsonResponse({'error': 'Invalid request'})

@csrf_exempt
def get_my_courses(request):
    if request.method == 'GET':

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Login required'})

        enrollments = Enrollment.objects.filter(user=request.user)

        data = []
        for enrollment in enrollments:
            course = enrollment.course
            data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description
            })

        return JsonResponse(data, safe=False)
    
    return JsonResponse({'error': 'Invalid request'})

@csrf_exempt
def add_video(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        course_id = data.get('course_id')
        youtube_link = data.get('youtube_link')

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'})

        Video.objects.create(
            course=course,
            youtube_link=youtube_link
        )

        return JsonResponse({'message': 'Video added successfully'})
    
    return JsonResponse({'error': 'Invalid request'})

def get_videos(request, course_id):
    if request.method == 'GET':
        videos = Video.objects.filter(course_id=course_id)

        data = []
        for video in videos:
            data.append({
                'id': video.id,
                'youtube_link': video.youtube_link
            })

        return JsonResponse(data, safe=False)
    
    return JsonResponse({'error': 'Invalid request'})