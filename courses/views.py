from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Course, Video

@login_required
def course_list(request):
    if request.user.role == 'trainer':
        courses = Course.objects.filter(trainer=request.user)
    else:
        courses = Course.objects.filter(is_approved=True)
    return render(request, 'courses/course_list.html', {'courses': courses})

@login_required
def create_course(request):
    if request.user.role != 'trainer':
        messages.error(request, "Only trainers can create courses.")
        return redirect('course_list')
    
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        course = Course.objects.create(
            title=title,
            description=description,
            trainer=request.user
        )
        messages.success(request, "Course created successfully!")
        return redirect('course_detail', pk=course.pk)
    return render(request, 'courses/create_course.html')

@login_required
def course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk)
    videos = course.videos.all()
    
    enrollment = None
    if request.user.role == 'student':
        try:
            from enrollment.models import Enrollment
            enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        except:
            pass
    
    return render(request, 'courses/course_detail.html', {
        'course': course,
        'videos': videos,
        'enrollment': enrollment
    })

@login_required
def add_video(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.user != course.trainer:
        messages.error(request, "You can only add videos to your own courses.")
        return redirect('course_list')
    
    if request.method == 'POST':
        title = request.POST.get('title')
        youtube_link = request.POST.get('youtube_link')
        Video.objects.create(course=course, title=title, youtube_link=youtube_link)
        messages.success(request, "Video added successfully!")
        return redirect('course_detail', pk=course_id)
    
    return render(request, 'courses/add_video.html', {'course': course})