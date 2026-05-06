from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
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
        if user.role == 'student':
            if not course.students.filter(id=user.id).exists():
                return JsonResponse({'error': 'Access denied'}, status=403)
            
            from course.models import EnrollmentExpiry
            from django.utils import timezone
            expiry = EnrollmentExpiry.objects.filter(course=course, student=user).first()
            if expiry and expiry.expires_at and expiry.expires_at < timezone.now():
                # Auto-unenroll
                course.students.remove(user)
                expiry.delete()
                return JsonResponse({'error': 'Your enrollment has expired'}, status=403)

        videos = course.videos.all()

        data = []
        for v in videos:
            data.append({
                'id': v.id,
                'title': v.title,
                'youtube_url': v.youtube_url,
                'order': v.order
            })

        return JsonResponse({'videos': data})

    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)



@login_required(login_url='/login/')
def video_page(request, course_id):
    from course.models import Course, EnrollmentExpiry
    from django.utils import timezone
    if request.user.role == 'student':
        try:
            course = Course.objects.get(id=course_id)
            expiry = EnrollmentExpiry.objects.filter(course=course, student=request.user).first()
            if expiry and expiry.expires_at and expiry.expires_at < timezone.now():
                course.students.remove(request.user)
                expiry.delete()
        except Course.DoesNotExist:
            pass
            
    return render(request, 'video.html', {'course_id': course_id})

@csrf_exempt
@login_required(login_url='/login/')
def reorder_videos(request):
    if request.method == 'POST':
        if request.user.role not in ['admin', 'trainer']:
            return JsonResponse({'error': 'Permission denied'}, status=403)
            
        data = json.loads(request.body)
        course_id = data.get('course_id')
        video_orders = data.get('video_orders') # list of {id: 1, order: 0}
        
        try:
            course = Course.objects.get(id=course_id)
            if request.user.role == 'trainer' and course.trainer != request.user:
                return JsonResponse({'error': 'Permission denied'}, status=403)
                
            for vo in video_orders:
                Video.objects.filter(id=vo['id'], course=course).update(order=vo['order'])
                
            return JsonResponse({'message': 'Videos reordered'})
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)
            
    return JsonResponse({'error': 'POST only'}, status=405)