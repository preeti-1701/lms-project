from rest_framework import viewsets
from .models import Course, Video
from .serializers import CourseSerializer, VideoSerializer

from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


@api_view(['POST'])
def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=400
        )

    User.objects.create_user(
        username=username,
        password=password
    )

    return Response(
        {"message": "User created successfully"}
    )