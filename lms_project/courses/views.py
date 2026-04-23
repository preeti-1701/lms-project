from django.shortcuts import render, get_object_or_404
from .models import Course, Video
from enrollments.models import Enrollment

def course_list(request):
    if request.user.role == 'student':
        enrollments = Enrollment.objects.filter(student=request.user)
        courses = [e.course for e in enrollments]
    else:
        courses = Course.objects.all()

    return render(request, 'courses/course_list.html', {'courses': courses})


def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    
    if request.user.role == 'student':
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            return render(request, 'core/unauthorized.html')

    videos = Video.objects.filter(course=course)

    return render(request, 'courses/course_detail.html', {
        'course': course,
        'videos': videos
    })