from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .models import Course
from .serializers import CourseSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


# ✅ REGISTER
@api_view(['POST'])
def register_user(request):
    data = request.data

    user = User.objects.create_user(
        username=data.get("username"),
        password=data.get("password"),
        role=data.get("role", "student")
    )

    return Response({
        "message": "User registered successfully",
        "username": user.username
    })


# ✅ LOGIN
@api_view(['POST'])
def login_user(request):
    print("DATA:", request.data)
    username = request.data.get("username")
    password = request.data.get("password")
   
    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({
            "message": "Login successful",
            "username": user.username,
            "role": user.role
        })
    
    return Response({"error": "Invalid credentials"}, status=400)


# ✅ DASHBOARD (Protected)
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses(request):
    courses = Course.objects.all()

    data = []
    for c in courses:
        progress = random.randint(0, 100)

        if progress == 100:
            tag = "completed"
        elif progress > 0:
            tag = "in-progress"
        else:
            tag = "not-started"

        data.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "youtube_link": c.youtube_link,

            # 🔥 REQUIRED FOR YOUR UI
            "tag": tag,
            "progress": progress,
            "duration": "2h 30m",
            "lessons": 10,

            # 🎨 UI styling
            "color": "#f3f4f6",
            "accent": "#111827",
            "abbr": c.title[:2].upper()
        })

    return Response(data)
    
# ✅ ADD COURSE (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course(request):
    if request.user.role != 'admin':
        return Response({"error": "Only admin can add"}, status=403)

    data = request.data
    course = Course.objects.create(
        title=data.get("title"),
        description=data.get("description"),
        youtube_link=data.get("youtube_link"),
        created_by=request.user
    )

    return Response({"message": "Course added successfully"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_course(request, pk):
    try:
        course = Course.objects.get(id=pk)
    except Course.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    course.title = request.data.get("title", course.title)
    course.description = request.data.get("description", course.description)
    course.youtube_link = request.data.get("youtube_link", course.youtube_link)
    course.save()

    return Response({"message": "Updated"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, pk):
    try:
        course = Course.objects.get(id=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    # 🔐 Only admin can delete
    if request.user.role != "admin":
        return Response({"error": "Not allowed"}, status=403)

    course.delete()
    return Response({"message": "Course deleted"})