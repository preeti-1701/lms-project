from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from courses.models import Video
from enrollment.models import Enrollment
from django.http import JsonResponse

@login_required
def play_video(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    course = video.course

    # Check enrollment for students
    if request.user.role == 'student':
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        if not enrollment:
            return render(request, 'videos/access_denied.html', {'message': 'You are not enrolled in this course.'})

    return render(request, 'videos/video_player.html', {
        'video': video,
        'course': course,
        'user': request.user
    })