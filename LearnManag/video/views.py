from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from course.models import Course
from .models import Video
import json

@csrf_exempt
def add_video(request):
    if request.method == 'POST':

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Login required'}, status=401)

        if request.user.role not in ['admin', 'trainer']:
            return JsonResponse({'error': 'Permission denied'}, status=403)

        data = json.loads(request.body)

        course_id = data.get('course_id')
        title = data.get('title')
        youtube_url = data.get('youtube_url')

        if not course_id or not title or not youtube_url:
            return JsonResponse({'error': 'course_id, title, and youtube_url are required'}, status=400)

        try:
            course = Course.objects.get(id=course_id)

            video = Video.objects.create(
                course=course,
                title=title,
                youtube_url=youtube_url
            )

            return JsonResponse({'message': 'Video added'})

        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def get_videos(request, course_id):

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required'}, status=401)

    user = request.user

    try:
        course = Course.objects.get(id=course_id)

        # 🔥 ACCESS CONTROL
        if user.role == 'student' and user not in course.students.all():
            return JsonResponse({'error': 'Access denied'}, status=403)

        videos = course.videos.all()

        data = []
        for v in videos:
            data.append({
                'title': v.title,
                'youtube_url': v.youtube_url
            })

        return JsonResponse({'videos': data})

    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)



def video_page(request, course_id):
    return render(request, 'video.html', {'course_id': course_id})