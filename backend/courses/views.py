from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Course, Video


# ✅ GET ALL COURSES
@api_view(['GET'])
def list_courses(request):
    courses = Course.objects.all()

    data = []
    for c in courses:
        data.append({
            "id": c.id,
            "title": c.title
        })

    return Response(data)


# ✅ CREATE COURSE
@api_view(['POST'])
def create_course(request):
    Course.objects.create(
        title=request.data['title'],
        created_by_id=1
    )
    return Response({"msg": "created"})


# ✅ GET VIDEOS BY COURSE (your code)
@api_view(['GET'])
def course_videos(request, course_id):
    videos = Video.objects.filter(course_id=course_id)

    data = []
    for v in videos:
        data.append({
            "id": v.id,
            "title": v.title,
            "url": v.video_url
        })

    return Response(data)