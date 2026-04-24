from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import CustomUser, Course, Video, Enrollment, VideoProgress, AuditLog
from .serializers import (
    UserSerializer,
    RegisterStudentSerializer,
    RegisterTrainerSerializer,
    LoginSerializer,
    CourseSerializer,
    CourseWriteSerializer,
    VideoSerializer,
    EnrollmentSerializer,
    VideoProgressSerializer,
    AuditLogSerializer,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR")


def log_action(user, action, ip=None, details=""):
    AuditLog.objects.create(user=user, action=action, ip_address=ip, details=details)


# ── Auth ──────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_student(request):
    serializer = RegisterStudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Account created! Please sign in."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_trainer(request):
    serializer = RegisterTrainerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Application submitted! Await verification."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    identifier = serializer.validated_data["identifier"]
    password = serializer.validated_data["password"]
    role = serializer.validated_data["role"]

    # Find user by email or mobile
    try:
        user = CustomUser.objects.get(email=identifier, role=role)
    except CustomUser.DoesNotExist:
        try:
            user = CustomUser.objects.get(mobile=identifier, role=role)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid credentials. Please try again."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({"error": "Invalid credentials. Please try again."}, status=status.HTTP_401_UNAUTHORIZED)

    if user.status != "active":
        return Response({"error": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)

    # Update last login
    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])

    token, _ = Token.objects.get_or_create(user=user)
    ip = get_client_ip(request)
    log_action(user, "LOGIN", ip=ip, details=f"Role: {role}")

    return Response({
        "token": token.key,
        "user": UserSerializer(user).data,
    })


@api_view(["POST"])
def logout_view(request):
    ip = get_client_ip(request)
    log_action(request.user, "LOGOUT", ip=ip, details="User logged out")
    Token.objects.filter(user=request.user).delete()
    return Response({"message": "Logged out successfully."})


@api_view(["GET"])
def me(request):
    return Response(UserSerializer(request.user).data)


# ── Courses ────────────────────────────────────────────────────────────────────

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.prefetch_related("videos").select_related("trainer").all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CourseWriteSerializer
        return CourseSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ("trainer", "admin"):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only trainers or admins can create courses.")
        serializer.save(trainer=user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.prefetch_related("videos").select_related("trainer").all()

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return CourseWriteSerializer
        return CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ── Videos ────────────────────────────────────────────────────────────────────

@api_view(["POST"])
def add_video(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role not in ("trainer", "admin") and course.trainer != request.user:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = VideoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_video(request, video_id):
    try:
        video = Video.objects.select_related("course__trainer").get(pk=video_id)
    except Video.DoesNotExist:
        return Response({"error": "Video not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role not in ("admin",) and video.course.trainer != request.user:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    video.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Enrollments ───────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def enrollments(request):
    if request.method == "GET":
        qs = Enrollment.objects.filter(student=request.user).select_related("course__trainer").prefetch_related("course__videos")
        return Response(EnrollmentSerializer(qs, many=True).data)

    # POST: enroll in a course
    course_id = request.data.get("course_id")
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
    if not created:
        return Response({"error": "Already enrolled."}, status=status.HTTP_400_BAD_REQUEST)

    log_action(request.user, "ENROLLED", details=f"Course: {course.title}")
    return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
def unenroll(request, course_id):
    try:
        enrollment = Enrollment.objects.get(student=request.user, course_id=course_id)
    except Enrollment.DoesNotExist:
        return Response({"error": "Enrollment not found."}, status=status.HTTP_404_NOT_FOUND)
    enrollment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Video Progress ─────────────────────────────────────────────────────────────

@api_view(["GET"])
def course_progress(request, course_id):
    try:
        course = Course.objects.prefetch_related("videos").get(pk=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    total = course.videos.count()
    if total == 0:
        return Response({"progress": 0, "watched": 0, "total": 0})

    watched = VideoProgress.objects.filter(
        student=request.user,
        video__course=course,
        watched=True,
    ).count()

    return Response({"progress": round((watched / total) * 100), "watched": watched, "total": total})


@api_view(["POST"])
def mark_watched(request):
    video_id = request.data.get("video_id")
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return Response({"error": "Video not found."}, status=status.HTTP_404_NOT_FOUND)

    VideoProgress.objects.update_or_create(
        student=request.user, video=video,
        defaults={"watched": True},
    )
    return Response({"message": "Marked as watched."})


# ── Admin: Users ──────────────────────────────────────────────────────────────

@api_view(["GET"])
def all_users(request):
    if request.user.role != "admin":
        return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
    users = CustomUser.objects.all()
    return Response(UserSerializer(users, many=True).data)


@api_view(["POST"])
def create_user(request):
    if request.user.role != "admin":
        return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

    role = request.data.get("role", "student")
    if role == "student":
        serializer = RegisterStudentSerializer(data=request.data)
    else:
        serializer = RegisterTrainerSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        log_action(request.user, "CREATED", details=f"Created user {user.email} [{role}]")
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def toggle_user_status(request, user_id):
    if request.user.role != "admin":
        return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    user.status = "disabled" if user.status == "active" else "active"
    user.save(update_fields=["status"])
    action = "DISABLED" if user.status == "disabled" else "LOGIN"
    log_action(request.user, action, details=f"Status toggled for {user.email}")
    return Response({"status": user.status})


@api_view(["POST"])
def assign_courses(request, user_id):
    if request.user.role != "admin":
        return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = CustomUser.objects.get(pk=user_id, role="student")
    except CustomUser.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    course_ids = request.data.get("course_ids", [])
    Enrollment.objects.filter(student=user).delete()
    for cid in course_ids:
        try:
            course = Course.objects.get(pk=cid)
            Enrollment.objects.get_or_create(student=user, course=course)
        except Course.DoesNotExist:
            pass
    return Response({"message": "Courses assigned."})


# ── Admin: Audit Log ──────────────────────────────────────────────────────────

@api_view(["GET"])
def audit_log(request):
    if request.user.role != "admin":
        return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
    logs = AuditLog.objects.select_related("user").all()[:200]
    return Response(AuditLogSerializer(logs, many=True).data)