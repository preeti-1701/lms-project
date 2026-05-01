from rest_framework.authtoken.models import Token
from urllib import request
import uuid

from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from courses.models import Course, Video, Enrollment, VideoProgress

from rest_framework_simplejwt.tokens import RefreshToken

from accounts.utils import validate_session
from .models import UserSession

User = get_user_model()


# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):

    # 🔐 validate session
    session_check = validate_session(request)
    if session_check:
        return session_check

    # 👮 admin only
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    # 📥 get data
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')

    # ❗ validation
    if not username or not password or not role:
        return Response(
            {'error': 'username, password and role are required'},
            status=400
        )

    # ❗ check duplicate user
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=400
        )

    try:
        # ✅ create user (password hashed automatically)
        user = User.objects.create_user(
            username=username,
            password=password,
            role=role
        )

        user.first_name = first_name or ''
        user.last_name = last_name or ''
        user.save()

        return Response({
            'message': 'User created successfully'
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )


@api_view(['POST'])
def login_api(request):

    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response({'error': 'Invalid username or password'}, status=401)

    if not user.is_active:
        return Response({'error': 'User disabled'}, status=403)

    # 🔥 Remove old sessions (optional but recommended)
    UserSession.objects.filter(user=user).delete()

    # ✅ Create new session
    session_token = str(uuid.uuid4())

    UserSession.objects.create(
        user=user,
        session_token=session_token,
        is_active=True
    )


    # Token (DRF)
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'access_token': token.key,
        'session_token': session_token,
        'role': user.role,
        'username': user.username
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_students(request):

    session_check = validate_session(request)
    if session_check:
        return session_check
    
    students = User.objects.filter(role='student').values(
        'id', 'first_name', 'last_name', 'username'
    )
    return Response(list(students))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def force_logout(request):
    # 🔐 Session validation (so only active admin session can do this)
    session_check = validate_session(request)
    if session_check:
        return session_check

    # 👮 Role check
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id required'}, status=400)

    try:
        target = User.objects.get(id=int(user_id))
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # ❗ Deactivate ALL active sessions of that user
    updated = UserSession.objects.filter(user=target, is_active=True).update(is_active=False)

    # (Optional) also clear cached token on User model
    target.session_token = None
    target.save()

    return Response({
        'message': 'User logged out',
        'affected_sessions': updated
    })


# ✅ NEW: Disable user (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])

def disable_user(request, user_id):

    # Validate active session
    session_check = validate_session(request)
    if session_check:
        return session_check

    # Admin only
    if request.user.role != 'admin':
        return Response(
            {'error':'Unauthorized'},
            status=403
        )


    try: 
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error':'User not found'},
            status=404
        )

    # prevent admin disabling self
    if user == request.user:
        return Response(
            {
             'error':
             'Admin cannot disable self'
            },
            status=400
        )


    # optional:
    # prevent disabling other admins
    if user.role == 'admin':
        return Response(
            {
             'error':
             'Another admin cannot be disabled'
            },
            status=400
        )


    # already disabled check
    if not user.is_active:
        return Response(
            {
             'message':
             'User already disabled'
            }
        )

    # Disable user
    user.is_active=False
    user.save()

    return Response({

        'message':
        'User disabled successfully',

        'user_id':
        user.id,

        'status':
        'disabled'

    })

# ✅ NEW: Enable user (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])

def enable_user(request, user_id):

    # validate active session
    session_check = validate_session(request)
    if session_check:
        return session_check

    # admin only
    if request.user.role != 'admin':
        return Response(
            {'error':'Unauthorized'},
            status=403
        )

    try:
        user = User.objects.get(id=user_id)

    except User.DoesNotExist:
        return Response(
            {'error':'User not found'},
            status=404
        )


    # optional: prevent enabling admins manually
    if user.role == 'admin':
        return Response(
          {'error':'Cannot modify admin'},
          status=400
        )

    # already enabled
    if user.is_active:
        return Response(
            {
             'message':
             'User already active'
            }
        )

    user.is_active = True
    user.save()

    return Response({

       'message':
       'User enabled successfully',

       'user_id':
       user.id,

       'status':
       'enabled'

    })


# ✅ NEW: Edit user details (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_user(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    if request.user.role != 'admin':
        return Response(
            {'error':'Unauthorized'},
            status=403
        )

    user_id = request.data.get('user_id')

    try:
        user = User.objects.get(
           id=int(user_id)
        )

    except User.DoesNotExist:
        return Response(
          {'error':'User not found'},
          status=404
        )


    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    role = request.data.get('role')

    if first_name:
        user.first_name = first_name

    if last_name:
        user.last_name = last_name

    if role:
        user.role = role

    user.save()

    return Response({
      'message':'User updated successfully'
    })

# ✅ NEW: List active sessions (Admin only)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_sessions(request):
 
 session_check = validate_session(request)
 if session_check:
    return session_check

 if request.user.role!='admin':
   return Response({'error':'Unauthorized'}, status=403
   )

 sessions=UserSession.objects.filter(
   is_active=True
 ).values(
 'user__username',
 'ip_address',
 'device_info',
 'login_time'
 )

 return Response(list(sessions))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):

    if request.user.role != 'admin':
        return Response(
          {'error':'Unauthorized'},
          status=403
        )

    data={
      "users":User.objects.count(),
      "courses":Course.objects.count(),
      "videos":Video.objects.count(),
      "enrollments":Enrollment.objects.count(),
      "disabled_users":
         User.objects.filter(
          is_active=False
         ).count()
    }

    return Response(data)


# ========================= Self logout =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):

    # Validate active session for this request
    session_check = validate_session(request)
    if session_check:
        return session_check

    session_token = request.headers.get('Session-Token')

    if not session_token:
        return Response({'error': 'Session token missing'}, status=400)

    # Deactivate the session associated with this user and token
    updated = UserSession.objects.filter(
        user=request.user,
        session_token=session_token,
        is_active=True
    ).update(is_active=False)

    return Response({
        'message': 'Logged out',
        'affected_sessions': updated
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trainer_stats(request):


    if request.user.role != 'trainer':
        return Response(
            {'error':'Unauthorized'},
            status=403
        )

    courses = Course.objects.filter(
        trainer=request.user
    ).count()


    videos = Video.objects.filter(
        course__trainer=request.user
    ).count()


    data = {
       'courses':courses,
       'videos':videos,
    }

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_stats(request):

    if request.user.role!='student':
        return Response(
           {'error':'Unauthorized'},
           status=403
        )

    enrollments=Enrollment.objects.filter(student=request.user)
    course_count=enrollments.count()
    total_videos=0
    completed=0


    for enroll in enrollments:

        videos=Video.objects.filter(course=enroll.course)

        total_videos+=videos.count()

        for v in videos:

            if VideoProgress.objects.filter(
               student=request.user,
               video=v,
               completed=True
            ).exists():

                completed+=1

    progress=0

    if total_videos>0:
       progress=round(
         completed/total_videos*100
       )


    return Response({

      'courses':course_count,
      'completed':completed,
      'total_videos':total_videos,
      'progress':progress

    })

# list all users with active session info (Admin only)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):

    if request.user.role!='admin':
        return Response(
          {'error':'Unauthorized'},
          status=403
        )

    users=User.objects.all()

    data=[]

    for u in users:
        active_session=UserSession.objects.filter(user=u, is_active=True).exists()

        data.append({
          'id':u.id,
          'username':u.username,
          'first_name':u.first_name,
          'last_name':u.last_name,
          'role':u.role,
          'is_active':u.is_active,
          'has_active_session':
             active_session
        })

    return Response(data)