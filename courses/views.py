from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Course, Enrollment, Video, VideoProgress, ActiveSession
from .serializers import CourseSerializer # Assumes you have the serializer we discussed

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from reportlab.pdfgen import canvas
from io import BytesIO
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

# ---------- AUTH ----------

@api_view(['POST'])
@permission_classes([AllowAny]) # Fixes 401 on Register
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created'}, status=201)


# ---------- COURSES ----------

@api_view(['GET'])
@permission_classes([AllowAny]) # Allow students to see catalog before login
def get_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    Course.objects.create(
        title=request.data.get("title"),
        description=request.data.get("description")
    )
    return Response({"message": "Course added"}, status=201)

# ---------- ENROLL ----------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    course_id = request.data.get("course_id")
    course = get_object_or_404(Course, id=course_id)

    Enrollment.objects.get_or_create(user=request.user, course=course)
    return Response({"message": "Successfully enrolled"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_courses(request):

    enrollments = Enrollment.objects.filter(
        user=request.user
    ).select_related('course')

    data = []

    for enrollment in enrollments:

        course = enrollment.course

        videos = Video.objects.filter(course=course)

        total_videos = videos.count()

        completed_videos = VideoProgress.objects.filter(
            user=request.user,
            video__in=videos,
            completed=True
        ).count()

        progress = 0

        if total_videos > 0:
            progress = int(
                (completed_videos / total_videos) * 100
            )

        data.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "progress": progress,
            "completed_videos": completed_videos,
            "total_videos": total_videos,
        })

    return Response(data)

# ---------- VIDEO ----------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_video(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    course = get_object_or_404(Course, id=request.data.get("course_id"))
    Video.objects.create(
        course=course,
        title=request.data.get("title"),
        youtube_link=request.data.get("youtube_link")
    )
    return Response({"message": "Video added"}, status=201)

# ---------- COURSE DETAIL ----------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    # Security Check: Ensure user is enrolled
    if not Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({"error": "Not enrolled in this course"}, status=403)

    # Uses the Serializer we refined earlier to handle progress logic
    serializer = CourseSerializer(course, context={'request': request})
    return Response(serializer.data)

# ---------- MARK COMPLETE ----------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_video_complete(request):
    video_id = request.data.get("video_id")
    video = get_object_or_404(Video, id=video_id)

    progress, created = VideoProgress.objects.get_or_create(
        user=request.user,
        video=video
    )

    progress.completed = True
    progress.save()

    return Response({"message": "Progress saved"})

# ---------- USER ----------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):

    # ✅ Get current JWT token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return Response({"error": "No token"}, status=401)

    token = auth_header.split()[1]

    # ✅ Update active session
    ActiveSession.objects.update_or_create(
        user=request.user,
        defaults={"token": token}
    )

    return Response({
        "username": request.user.username,
        "is_staff": request.user.is_staff
    })

# ---------- CERTIFICATE ----------

@api_view(['GET'])
def generate_certificate(request, course_id):
    # Manual Auth check for PDF generation
    auth = JWTAuthentication()
    header = request.headers.get("Authorization")
    if not header:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        token = header.split()[1]
        validated = auth.get_validated_token(token)
        user = auth.get_user(validated)
    except:
        return Response({"error": "Invalid Session"}, status=401)

    course = get_object_or_404(Course, id=course_id)
    videos = Video.objects.filter(course=course)
    total = videos.count()
    
    if total == 0:
        return Response({"error": "Course has no content"}, status=400)

    completed = VideoProgress.objects.filter(
        user=user,
        video__in=videos,
        completed=True
    ).count()

    if completed < total:
        return Response({"error": "Course not fully completed"}, status=403)

    # PDF Generation
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(300, 750, "CERTIFICATE OF COMPLETION")
    p.setFont("Helvetica", 18)
    p.drawCentredString(300, 650, f"This is to certify that {user.username}")
    p.drawCentredString(300, 620, f"has successfully completed the course:")
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(300, 580, f"{course.title}")
    p.setFont("Helvetica", 12)
    p.drawCentredString(300, 500, f"Issued on: {user.date_joined.strftime('%Y-%m-%d')}")
    p.save()
    
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resume_course(request, course_id):

    course = Course.objects.get(id=course_id)

    videos = Video.objects.filter(course=course)

    progress = VideoProgress.objects.filter(
        user=request.user,
        video__in=videos,
        completed=False
    ).order_by('-updated_at').first()

    if progress:
        return Response({
            "video_id": progress.video.id
        })

    first_video = videos.first()

    return Response({"video_id": first_video.id if first_video else None
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):

    return Response({
        "students": User.objects.count(),
        "courses": Course.objects.count(),
        "enrollments": Enrollment.objects.count(),
    })