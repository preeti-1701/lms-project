from urllib import request

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import User

from .utils import get_tokens_for_user
from django.shortcuts import render

def login_page(request):
    return render(request, "login.html")
    
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is not None:
            # FIX: Prevent disabled users from logging in
            if not user.is_active:
                return Response({"error": "This account has been disabled."}, status=403)

            user.last_login_ip = get_client_ip(request)
            user.last_login_device = request.META.get('HTTP_USER_AGENT')
            user.save()

            tokens = get_tokens_for_user(user)
            
            # FIX: Ensure terminal-created superusers get the admin dashboard
            response_role = 'admin' if user.is_superuser else user.role
            
            return Response({
                "access": tokens["access"],
                "role": response_role
            })

        return Response({"error": "Invalid credentials"}, status=401)
    
class ForceLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        admin_user = request.user

        if admin_user.role != 'admin':
            return Response({"error": "Not allowed"}, status=403)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.token_version += 1
        user.save()

        return Response({"message": "User logged out from all devices"})
    
from rest_framework import status

class CreateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only admin can create users
        if request.user.role != 'admin':
            return Response({"error": "Only admins can create users"}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        password = request.data.get("password")
        full_name = request.data.get("full_name")
        role = request.data.get("role", "student")

        if User.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Using your CustomUserManager
        user = User.objects.create_user(email=email, password=password, role=role)
        user.full_name = full_name
        user.save()

        return Response({"message": f"{role.capitalize()} created successfully!"}, status=status.HTTP_201_CREATED)
    
from .serializers import UserSerializer

class UsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admins can view users"}, status=403)
        
        # FIX: Fetch ALL users now, not just students
        users = User.objects.all().order_by('-id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        if request.user.role != 'admin':
            return Response({"error": "Only admins can edit users"}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        
        # Update user fields if they are provided in the request
        if 'full_name' in request.data:
            user.full_name = request.data['full_name']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'role' in request.data:
            user.role = request.data['role']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
            
        user.save()
        return Response({"message": "User updated successfully"})