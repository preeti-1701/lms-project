from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserRole, Profile
from .serializers import UserSerializer, LoginSerializer, CreateUserSerializer
from sessions_app.models import UserSession


def get_device_info(request):
    ua = request.META.get('HTTP_USER_AGENT', 'Unknown')
    return ua[:200]


def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', 'unknown')


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user.username, password=password)
    if user is None:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    # Check if profile is active
    try:
        if not user.profile.is_active:
            return Response({'error': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)
    except Profile.DoesNotExist:
        pass

    # Single session policy: deactivate previous sessions
    UserSession.objects.filter(user=user, is_active=True).update(
        is_active=False,
        logout_at=__import__('django.utils.timezone', fromlist=['now']).now()
    )

    # Create new session
    UserSession.objects.create(
        user=user,
        device_info=get_device_info(request),
        ip_address=get_client_ip(request),
    )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': user_data,
    })


@api_view(['POST'])
def logout_view(request):
    # Deactivate current sessions
    from django.utils.timezone import now
    UserSession.objects.filter(user=request.user, is_active=True).update(
        is_active=False, logout_at=now()
    )
    return Response({'message': 'Logged out'})


@api_view(['GET'])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
def users_list(request):
    # Admin only
    try:
        if request.user.user_role.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    except UserRole.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all().order_by('-date_joined')
    return Response(UserSerializer(users, many=True).data)


@api_view(['PATCH'])
def toggle_user_status(request, user_id):
    try:
        if request.user.user_role.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    except UserRole.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    try:
        profile = Profile.objects.get(user_id=user_id)
    except Profile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    profile.is_active = not profile.is_active
    profile.save()
    return Response({'is_active': profile.is_active})


@api_view(['POST'])
def create_user(request):
    try:
        if request.user.user_role.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    except UserRole.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    serializer = CreateUserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    d = serializer.validated_data

    if User.objects.filter(email=d['email']).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    name_parts = d['name'].split(' ', 1)
    user = User.objects.create_user(
        username=d['email'],
        email=d['email'],
        password=d['password'],
        first_name=name_parts[0],
        last_name=name_parts[1] if len(name_parts) > 1 else '',
    )
    Profile.objects.create(user=user)
    UserRole.objects.create(user=user, role=d['role'])

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
