from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Course
from .serializers import CourseSerializer


class StudentCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        courses = Course.objects.filter(assigned_students=user)
        serializer = CourseSerializer(courses, many=True)

        return Response(serializer.data)