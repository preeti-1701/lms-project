# enrollment/views.py
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_POST

from courses.models import Course
from .models import Enrollment


@login_required
def enroll_course(request, course_id):
    """Enroll student in a course"""
    if request.user.role != 'student':
        messages.error(request, "Only students can enroll in courses.")
        return redirect('course_list')
    
    course = get_object_or_404(Course, id=course_id, is_approved=True)
    
    enrollment, created = Enrollment.objects.get_or_create(
        student=request.user,
        course=course
    )
    
    if created:
        messages.success(request, f"Successfully enrolled in {course.title}!")
    else:
        messages.info(request, "You are already enrolled in this course.")
    
    return redirect('course_detail', pk=course_id)


@login_required
def mark_progress(request, enrollment_id):
    """Manual course completion"""
    enrollment = get_object_or_404(Enrollment, id=enrollment_id, student=request.user)
    enrollment.update_progress(100)
    messages.success(request, "Course Completed! Certificate Generated.")
    return redirect('course_detail', pk=enrollment.course.id)


@require_POST
@login_required
def update_progress(request, enrollment_id):
    """Update course progress via AJAX or form (Recommended for YouTube API)"""
    enrollment = get_object_or_404(
        Enrollment,
        id=enrollment_id,
        student=request.user
    )
    
    try:
        progress = int(request.POST.get('progress', 0))
        
        if progress < 0 or progress > 100:
            messages.error(request, "Progress must be between 0 and 100.")
            return redirect('course_detail', pk=enrollment.course.id)
        
        was_completed = enrollment.completed
        enrollment.update_progress(progress)
        
        if not was_completed and enrollment.completed:
            messages.success(request, "Course Completed! Certificate Generated.")
        else:
            messages.info(request, f"Progress updated to {progress}%")
            
    except ValueError:
        messages.error(request, "Invalid progress value.")
    
    return redirect('course_detail', pk=enrollment.course.id)