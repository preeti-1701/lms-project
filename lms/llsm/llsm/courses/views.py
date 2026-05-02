from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Course, Enrollment

def student_courses(request):
    courses = Course.objects.filter(enrollment__student=request.user)
    return render(request, 'student_courses.html', {'courses': courses})


@login_required
def course_detail(request, id):
    course = get_object_or_404(Course, id=id)
    
    # Check if user is enrolled
    is_enrolled = False
    if request.user.is_authenticated:
        is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    
    # Handle enrollment
    if request.method == 'POST' and request.user.is_authenticated:
        if not is_enrolled:
            Enrollment.objects.create(student=request.user, course=course)
            messages.success(request, f'You have been enrolled in {course.title}.')
            is_enrolled = True
        else:
            messages.warning(request, 'You are already enrolled in this course.')
    
    return render(request, 'course_detail.html', {
        'course': course,
        'is_enrolled': is_enrolled,
    })