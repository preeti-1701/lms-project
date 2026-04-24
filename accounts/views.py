import uuid

from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from accounts.utils import validate_session
from .models import UserSession

User = get_user_model()


# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):

    session_check = validate_session(request)
    if session_check:
        return session_check
    
    #Only Admin Allowed
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)
    
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')
    
    user = User.objects.create_user(
        username=username,
        password=password,
        role=role
    )

    user.first_name = first_name
    user.last_name = last_name
    user.save()

    return Response({'message': 'User created successfully'},)


@api_view(['POST'])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    # 🔴 Validation
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)

    user = authenticate(username=username, password=password)

    if user:
        # 🔐 Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # 🔥 Generate new session token
        session_token = str(uuid.uuid4())

        # ❗ Deactivate old sessions (enforces single session)
        UserSession.objects.filter(user=user, is_active=True).update(is_active=False)

        # 🌐 Get IP address
        ip = request.META.get('REMOTE_ADDR')

        # 📱 Get device info
        device = request.META.get('HTTP_USER_AGENT')

        # ✅ Create new session record
        UserSession.objects.create(
            user=user,
            session_key=session_token,
            ip_address=ip,
            device_info=device,
            is_active=True
        )

        # ✅ Save session token in User (for quick validation if needed)
        user.session_token = session_token
        user.save()

        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,
            'username': user.username,
            'session_token': session_token,
            'ip_address': ip,
            'device': device
        })

    return Response({'error': 'Invalid credentials'}, status=401)


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_user(request):

    # 🔐 validate active session
    session_check = validate_session(request)
    if session_check:
        return session_check

    # 👮 admin only
    if request.user.role != 'admin':
        return Response(
            {'error':'Unauthorized'},
            status=403
        )

    user_id = request.data.get('user_id')

    if not user_id:
        return Response(
            {'error':'user_id required'},
            status=400
        )

    try:
        user = User.objects.get(id=int(user_id))

    except User.DoesNotExist:
        return Response(
            {'error':'User not found'},
            status=404
        )

    # optional safety: don't disable self
    if user == request.user:
        return Response(
            {'error':'Admin cannot disable self'},
            status=400
        )

    # 🔥 Disable user
    user.is_active = False
    user.save()

    return Response({
        'message':'User disabled successfully'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_user(request):

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
        user = User.objects.get(id=user_id)

    except User.DoesNotExist:
        return Response(
          {'error':'User not found'},
          status=404
        )

    user.is_active = True
    user.save()

    return Response({
       'message':'User enabled successfully'
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

 if request.user.role!='admin':
   return Response(
    {'error':'Unauthorized'},
    status=403
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