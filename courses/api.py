from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import serializers, status
from .models import Course, Video, VideoProgress, QuizAttempt, Certificate


# ── Serializers ──────────────────────────────────────────
class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'youtube_url', 'order']


class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    is_ongoing = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'is_active',
            'start_date', 'end_date', 'enrollment_deadline',
            'videos', 'student_count', 'days_left', 'is_ongoing'
        ]

    def get_student_count(self, obj):
        return obj.assigned_students.count()

    def get_days_left(self, obj):
        return obj.days_left()

    def get_is_ongoing(self, obj):
        return obj.is_ongoing()


class ProgressSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(source='video.title', read_only=True)
    course_title = serializers.CharField(source='video.course.title', read_only=True)
    percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoProgress
        fields = ['video_title', 'course_title', 'watched_seconds',
                  'duration_seconds', 'percentage', 'completed', 'last_watched']


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Certificate
        fields = ['certificate_id', 'course_title', 'issued_at']


# ── API Views ─────────────────────────────────────────────
class CourseListAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        if request.user.role == 'student':
            courses = request.user.enrolled_courses.filter(is_active=True)
        elif request.user.role == 'trainer':
            courses = Course.objects.filter(created_by=request.user)
        else:
            courses = Course.objects.all()

        if search:
            courses = courses.filter(title__icontains=search)

        serializer = CourseSerializer(courses, many=True)
        return Response({
            'count': courses.count(),
            'courses': serializer.data
        })


class CourseDetailAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

        if request.user.role == 'student':
            if course not in request.user.enrolled_courses.all():
                return Response({'error': 'Access denied'}, status=403)

        serializer = CourseSerializer(course)
        return Response(serializer.data)


class StudentProgressAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress = VideoProgress.objects.filter(student=request.user)
        serializer = ProgressSerializer(progress, many=True)

        total = progress.count()
        completed = progress.filter(completed=True).count()
        avg = int((completed / total) * 100) if total > 0 else 0

        return Response({
            'total_videos': total,
            'completed': completed,
            'overall_percentage': avg,
            'progress': serializer.data
        })


class CertificateListAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        certs = Certificate.objects.filter(student=request.user)
        serializer = CertificateSerializer(certs, many=True)
        return Response({
            'count': certs.count(),
            'certificates': serializer.data
        })


class UserProfileAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
            'date_joined': user.date_joined,
            'certificates_count': user.certificates.count(),
            'enrolled_courses': user.enrolled_courses.count() if user.role == 'student' else None,
        })