from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework import generics
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer, RegisterSerializer
from .models import UserSession
from .permissions import IsAdmin, IsAdminOrTrainer, IsStudent

class LoginView(APIView):
    permission_classes=[AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data = request.data, context={'request':request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data,status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        token = request.auth
        UserSession.objects.filter(user=request.user, token = str(token), is_active=True).update(is_active=False)

        refresh_token = request.data.get('refresh')
        if refresh_token :
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        
        return Response({'message':'Logged out successfully'},status=status.HTTP_200_OK)
    
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = RegisterSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminOnlyView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        return Response({"message": "Hello Admin"})
    
class TrainerView(APIView):
    permission_classes = [IsAdminOrTrainer]
    def get(self, request):
        return Response({"message": "Trainer Access"})

class StudentView(APIView):
    permission_classes = [IsStudent]
    def get(self, request):
        return Response({"message": "Student Access"})

class ForceLogoutView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        user_id = request.data.get("user_id")

        UserSession.objects.filter(user_id=user_id).update(is_active=False)

        return Response({"message": "User logged out from all devices"})
    
from django.contrib.auth import get_user_model
User = get_user_model()

    
class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
 
    def get(self, request):
        users = User.objects.all().order_by('id')
        data = [
            {
                "id":       u.id,
                "username": u.username,
                "email":    u.email,
                "role":     u.role,
            }
            for u in users
        ]
        return Response(data)