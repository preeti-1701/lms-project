from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from django.shortcuts import redirect

from .models import (
    Course,
    Enrollment,
    Video,
    LoginActivity
)

User = get_user_model()


# TOKEN AUTHENTICATION
def get_user_from_token(request):

    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return None, Response({
            'error': 'No token provided'
        }, status=401)

    try:
        token = auth_header.split()[1]

        user = Token.objects.get(key=token).user

        # SINGLE SESSION CHECK
        if user.active_token != token:

            return None, Response({
                'error': 'Session expired'
            }, status=401)

        return user, None

    except:

        return None, Response({
            'error': 'Invalid token'
        }, status=401)


# LOGIN
@api_view(['POST'])
def login_view(request):

    identifier = request.data.get('username')

    password = request.data.get('password')

    # USERNAME LOGIN
    user = authenticate(
        username=identifier,
        password=password
    )

    # EMAIL LOGIN
    if not user:

        try:

            user_obj = User.objects.get(email=identifier)

            user = authenticate(
                username=user_obj.username,
                password=password
            )

        except User.DoesNotExist:

            user = None

    if user:

        # REMOVE OLD TOKENS
        Token.objects.filter(user=user).delete()

        # CREATE NEW TOKEN
        token = Token.objects.create(user=user)

        # SAVE ACTIVE TOKEN
        user.active_token = token.key

        user.save()

        # TRACK LOGIN ACTIVITY
        device = request.data.get(
            'device',
            'Unknown Device'
        )

        ip = request.META.get(
            'REMOTE_ADDR',
            'Unknown IP'
        )

        LoginActivity.objects.create(
            user=user,
            device=device,
            ip_address=ip
        )

        return Response({
            'message': 'Login successful',
            'token': token.key,
            'role': user.role
        })

    return Response({
        'error': 'Invalid credentials'
    }, status=400)


# GET COURSES
@api_view(['GET'])
def get_courses(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    # TRAINER
    if user.role == 'trainer':

        courses = Course.objects.filter(
            created_by=user
        )

    # STUDENT
    elif user.role == 'student':

        courses = Course.objects.filter(
            enrollments__student=user
        )

    # ADMIN
    else:

        courses = Course.objects.all()

    data = []

    for course in courses:

        data.append({
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'trainer': course.created_by.username
        })

    return Response(data)


# CREATE COURSE
@api_view(['POST'])
def create_course(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    title = request.data.get('title')

    description = request.data.get('description')

    trainer_id = request.data.get('trainer_id')

    # ADMIN ASSIGNS TRAINER
    if user.role == 'admin':

        if not trainer_id:

            return Response({
                'error': 'Trainer required'
            }, status=400)

        try:

            trainer = User.objects.get(
                id=trainer_id,
                role='trainer'
            )

        except User.DoesNotExist:

            return Response({
                'error': 'Invalid trainer'
            }, status=400)

    # TRAINER CREATES OWN COURSE
    elif user.role == 'trainer':

        trainer = user

    else:

        return Response({
            'error': 'Access denied'
        }, status=403)

    Course.objects.create(
        title=title,
        description=description,
        created_by=trainer
    )

    return Response({
        'message': 'Course created successfully'
    })


# GET COURSE VIDEOS
@api_view(['GET'])
def get_course_videos(request, course_id):

    user, error = get_user_from_token(request)

    if error:
        return error

    try:

        course = Course.objects.get(id=course_id)

    except Course.DoesNotExist:

        return Response({
            'error': 'Course not found'
        }, status=404)

    # STUDENT ACCESS
    if user.role == 'student':

        if not course.enrollments.filter(
            student=user
        ).exists():

            return Response({
                'error': 'Access denied'
            }, status=403)

    # TRAINER ACCESS
    elif user.role == 'trainer':

        if course.created_by != user:

            return Response({
                'error': 'Access denied'
            }, status=403)

    videos = course.videos.all().order_by('order')

    data = []

    for video in videos:

        data.append({
            'id': video.id,
            'title': video.title,
            'youtube_url': video.youtube_url
        })

    return Response(data)


# PLAY VIDEO
@api_view(['GET'])
def play_video(request, video_id):

    # TOKEN FROM HEADER
    auth_header = request.headers.get('Authorization')

    token = None

    # TOKEN FROM QUERY PARAM
    if not auth_header:

        token = request.GET.get('token')

    try:

        if auth_header:

            token = auth_header.split()[1]

        user = Token.objects.get(key=token).user

    except:

        return Response({
            'message': 'Please access videos through LMS application'
        }, status=401)

    try:

        video = Video.objects.get(id=video_id)

    except Video.DoesNotExist:

        return Response({
            'error': 'Video not found'
        }, status=404)

    course = video.course

    # STUDENT ACCESS
    if user.role == 'student':

        if not course.enrollments.filter(
            student=user
        ).exists():

            return Response({
                'error': 'Access denied'
            }, status=403)

    # TRAINER ACCESS
    elif user.role == 'trainer':

        if course.created_by != user:

            return Response({
                'error': 'Access denied'
            }, status=403)

    return redirect(video.youtube_url)
# PROFILE
@api_view(['GET'])
def get_profile(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    return Response({
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "phone": user.phone
    })


# GET ALL USERS
@api_view(['GET'])
def get_all_users(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role != 'admin':

        return Response({
            'error': 'Access denied'
        }, status=403)

    users = User.objects.all()

    data = []

    for u in users:

        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active
        })

    return Response(data)


# CREATE USER
@api_view(['POST'])
def create_user(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role != 'admin':

        return Response({
            'error': 'Access denied'
        }, status=403)

    username = request.data.get('username')

    email = request.data.get('email')

    password = request.data.get('password')

    role = request.data.get(
        'role',
        'student'
    )

    # VALIDATE ROLE
    if role not in [
        'admin',
        'trainer',
        'student'
    ]:

        return Response({
            'error': 'Invalid role'
        }, status=400)

    # DUPLICATE CHECK
    if User.objects.filter(
        username=username
    ).exists():

        return Response({
            'error': 'Username already exists'
        }, status=400)

    new_user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    new_user.role = role

    new_user.save()

    return Response({
        'message': 'User created successfully'
    })


# ENABLE / DISABLE USER
@api_view(['POST'])
def toggle_user_status(request, user_id):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role != 'admin':

        return Response({
            'error': 'Access denied'
        }, status=403)

    try:

        target = User.objects.get(id=user_id)

    except User.DoesNotExist:

        return Response({
            'error': 'User not found'
        }, status=404)

    target.is_active = not target.is_active

    target.save()

    return Response({
        'message': 'User status updated'
    })


# FORCE LOGOUT USER
@api_view(['POST'])
def force_logout_user(request, user_id):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role != 'admin':

        return Response({
            'error': 'Access denied'
        }, status=403)

    try:

        target = User.objects.get(id=user_id)

    except User.DoesNotExist:

        return Response({
            'error': 'User not found'
        }, status=404)

    Token.objects.filter(
        user=target
    ).delete()

    target.active_token = None

    target.save()

    return Response({
        'message': f'{target.username} logged out successfully'
    })


# ENROLL STUDENT
@api_view(['POST'])
def enroll_student(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role != 'admin':

        return Response({
            'error': 'Access denied'
        }, status=403)

    student_id = request.data.get('student_id')

    course_id = request.data.get('course_id')

    try:

        student = User.objects.get(
            id=student_id,
            role='student'
        )

    except User.DoesNotExist:

        return Response({
            'error': 'Invalid student'
        }, status=400)

    try:

        course = Course.objects.get(id=course_id)

    except Course.DoesNotExist:

        return Response({
            'error': 'Course not found'
        }, status=404)

    enrollment, created = Enrollment.objects.get_or_create(
        student=student,
        course=course
    )

    if not created:

        return Response({
            'error': 'Student already enrolled'
        }, status=400)

    return Response({
        'message': 'Student enrolled successfully'
    })


# ADD VIDEO
@api_view(['POST'])
def add_video(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role not in ['admin', 'trainer']:

        return Response({
            'error': 'Access denied'
        }, status=403)

    course_id = request.data.get('course_id')

    title = request.data.get('title')

    youtube_url = request.data.get('youtube_url')

    try:

        course = Course.objects.get(id=course_id)

    except Course.DoesNotExist:

        return Response({
            'error': 'Course not found'
        }, status=404)

    # TRAINER OWNERSHIP CHECK
    if user.role == 'trainer':

        if course.created_by != user:

            return Response({
                'error': 'Access denied'
            }, status=403)

    Video.objects.create(
        course=course,
        title=title,
        youtube_url=youtube_url
    )

    return Response({
        'message': 'Video added successfully'
    })
    
# LOGIN ACTIVITY
@api_view(['GET'])
def get_login_activity(request):

    user, error = get_user_from_token(request)

    if error:
        return error

    if user.role != 'admin':

        return Response({
            'error': 'Access denied'
        }, status=403)

    activities = LoginActivity.objects.all().order_by('-login_time')

    data = []

    for a in activities:

        data.append({
            'username': a.user.username,
            'ip_address': a.ip_address,
            'device': a.device,
            'login_time': a.login_time
        })

    return Response(data)