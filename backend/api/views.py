from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Course, Video, Enrollment, SessionLog
from .serializers import *

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = CustomUser.objects.get(email=email)
            if user.check_password(password) and user.is_active:
                SessionLog.objects.filter(user=user, is_active=True).update(is_active=False)
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                user.active_token = access_token
                user.save()
                ip = request.META.get('REMOTE_ADDR')
                device = request.META.get('HTTP_USER_AGENT', '')
                SessionLog.objects.create(user=user, ip_address=ip, device_info=device)
                return Response({
                    'access': access_token,
                    'refresh': str(refresh),
                    'role': user.role,
                    'email': user.email,
                })
            return Response({'error': 'Invalid credentials'}, status=400)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=400)

class RegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

class VideoListCreateView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]

class EnrollmentView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class StudentCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user)
        courses = [e.course for e in enrollments]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

class SessionListView(generics.ListAPIView):
    queryset = SessionLog.objects.filter(is_active=True)
    serializer_class = SessionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class ForceLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            user.active_token = None
            user.save()
            SessionLog.objects.filter(user=user, is_active=True).update(is_active=False)
            return Response({'message': 'User logged out successfully'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
class SetupView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        users = [
            {'email': 'admin@lms.com', 'username': 'admin', 'password': 'Admin@123', 'role': 'admin'},
            {'email': 'trainer1@lms.com', 'username': 'trainer1', 'password': 'Train@123', 'role': 'trainer'},
            {'email': 'student@lms.com', 'username': 'student1', 'password': 'pass1234', 'role': 'student'},
            {'email': 'student2@lms.com', 'username': 'student2', 'password': 'Stud@123', 'role': 'student'},
        ]
        for u in users:
            try:
                user = CustomUser.objects.get(email=u['email'])
                user.set_password(u['password'])
                user.role = u['role']
                user.is_active = True
                user.save()
            except CustomUser.DoesNotExist:
                pass
        return Response({'message': 'All passwords reset successfully!'})