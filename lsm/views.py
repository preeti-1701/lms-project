from django.shortcuts import render
from .models import Course


def get_courses(request):
    data = []
    courses = Course.objects.all()

    for course in courses:
        videos = course.video_set.all()
        video_list = []

        for v in videos:
            video_list.append({
                "title": v.title,
                "youtube_link": v.youtube_link
            })

        data.append({
            "course": course.title,
            "description": course.description,
            "videos": video_list
        })

    return render(request, "courses.html", {"courses": data})