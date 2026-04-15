from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User
from .serializers import RegisterSerializer, UserSerializer



# REGISTER 

class RegisterView(generics.CreateAPIView):
    
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # No login needed to register


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        # validate() checks email format, password rules, role choices
        serializer.is_valid(raise_exception=True)

        # save() calls RegisterSerializer.create() → hashes password → saves user
        user = serializer.save()

        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),  # Use this in the Authorization header
            }
        }, status=status.HTTP_201_CREATED)



#  LOGIN 

class LoginView(APIView):
    
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"error": "Both email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # authenticate() checks the email + hashed password match
        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "This account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)



# USERS  (Role-based access)

class UserListView(generics.ListAPIView):
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Must be logged in

    def get_queryset(self):
        
        user = self.request.user

        if user.role == 'admin':
            # Admin sees everyone
            return User.objects.all()

        elif user.role == 'trainer':
            # Trainer sees only students
            return User.objects.filter(role='student')

        else:
            # Student sees only themselves
            return User.objects.filter(pk=user.pk)