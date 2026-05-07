from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *

from users.models import User


@api_view(['GET'])
def list_courses(request):

    courses = Course.objects.all()

    data = []

    for c in courses:

        videos = Video.objects.filter(
            course=c
        )

        video_data = []

        for v in videos:

            video_data.append({

                "id": v.id,

                "title": v.title,

                "video": v.video_url
            })

        data.append({

            "id": c.id,

            "title": c.title,

            "description": c.description,

            "videos": video_data
        })

    return Response(data)

@api_view(['POST'])
def create_course(request):

    try:

        title = request.data.get(
            "title"
        )

        description = request.data.get(
            "description"
        )

        print(request.data)

        if not title:

            return Response({

                "error":
                "Title required"
            }, status=400)

        course = Course.objects.create(

            title=title,

            description=description
        )

        return Response({

            "message":
            "Course Created",

            "id":
            course.id
        })

    except Exception as e:

        print(e)

        return Response({

            "error":
            str(e)

        }, status=500)
@api_view(['POST'])
def add_video(request):

    try:

        print(request.data)

        course_name = request.data.get(
            "course"
        )

        title = request.data.get(
            "title"
        )

        video_url = request.data.get(
            "video_url"
        )

        course = Course.objects.get(
            title=course_name
        )

        Video.objects.create(

            course=course,

            title=title,

            video_url=video_url
        )

        return Response({

            "message":
            "Video Added"
        })

    except Exception as e:

        print(e)

        return Response({

            "error":
            str(e)

        }, status=500)
@api_view(['PUT'])
def update_video(request, id):

    try:

        video = Video.objects.get(
            id=id
        )

        video.title = request.data.get(
            "title"
        )

        video.video_url = request.data.get(
            "video_url"
        )

        video.save()

        return Response({

            "message":
            "Video Updated"
        })

    except Exception as e:

        return Response({

            "error":
            str(e)

        }, status=500)


@api_view(['DELETE'])
def delete_video(request, id):

    try:

        video = Video.objects.get(
            id=id
        )

        video.delete()

        return Response({

            "message":
            "Video Deleted"
        })

    except Exception as e:

        return Response({

            "error":
            str(e)

        }, status=500)
    
@api_view(['DELETE'])
def delete_course(request, id):

    try:

        course = Course.objects.get(
            id=id
        )

        course.delete()

        return Response({

            "message":
            "Course Deleted"
        })

    except Exception as e:

        return Response({

            "error":
            str(e)

        }, status=500)


@api_view(['POST'])
def assign_course(request):

    student = User.objects.get(

        username=request.data.get(
            "student"
        )
    )

    course = Course.objects.get(

        title=request.data.get(
            "course"
        )
    )

    Enrollment.objects.create(

        student=student,

        course=course
    )

    return Response({

        "message":
        "Assigned"
    })


@api_view(['GET'])
def student_courses(request):

    student_id = request.GET.get(
        "student"
    )

    enrollments = Enrollment.objects.filter(

        student_id=student_id
    )

    data = []

    for e in enrollments:

        course = e.course

        videos = Video.objects.filter(
            course=course
        )

        video_data = []

        for v in videos:

            video_data.append({

                "id": v.id,

                "title": v.title,

                "video": v.video_url
            })

        data.append({

            "id": course.id,

            "title": course.title,

            "description": course.description,

            "videos": video_data
        })

    return Response(data)