# enrollment/views.py
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_POST

from courses.models import Course
from .models import Enrollment


@require_POST
@login_required
def enroll_course(request, course_id):
    """Create an enrollment request for the course trainer to review."""
    if request.user.role != 'student':
        messages.error(request, "Only students can request enrollment in courses.")
        return redirect('course_list')
    
    course = get_object_or_404(Course, id=course_id, is_approved=True)
    
    enrollment, created = Enrollment.objects.get_or_create(
        student=request.user,
        course=course
    )
    
    if created:
        messages.success(request, f"Enrollment request sent to {course.trainer.email}.")
    elif enrollment.status == Enrollment.STATUS_APPROVED:
        messages.info(request, "You are already enrolled in this course.")
    elif enrollment.status == Enrollment.STATUS_REJECTED:
        enrollment.status = Enrollment.STATUS_PENDING
        enrollment.reviewed_at = None
        enrollment.save(update_fields=['status', 'reviewed_at', 'last_accessed'])
        messages.success(request, f"Enrollment request sent again to {course.trainer.email}.")
    else:
        messages.info(request, "Your enrollment request is already pending trainer approval.")
    
    return redirect('course_detail', pk=course_id)


@require_POST
@login_required
def review_enrollment(request, enrollment_id, action):
    """Allow a trainer to approve or reject requests for their own courses."""
    if request.user.role != 'trainer':
        messages.error(request, "Only trainers can review enrollment requests.")
        return redirect('course_list')

    enrollment = get_object_or_404(
        Enrollment,
        id=enrollment_id,
        course__trainer=request.user,
    )

    if action == 'approve':
        enrollment.approve()
        messages.success(
            request,
            f"{enrollment.student.email} can now access {enrollment.course.title}.",
        )
    elif action == 'reject':
        enrollment.reject()
        messages.info(
            request,
            f"Enrollment request from {enrollment.student.email} was rejected.",
        )
    else:
        messages.error(request, "Invalid enrollment action.")

    return redirect('dashboard:trainer_dashboard')


@login_required
def mark_progress(request, enrollment_id):
    """Manual course completion"""
    enrollment = get_object_or_404(Enrollment, id=enrollment_id, student=request.user)
    if not enrollment.is_approved:
        messages.error(request, "Your enrollment request must be approved before tracking progress.")
        return redirect('course_detail', pk=enrollment.course.id)

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
        student=request.user,
        status=Enrollment.STATUS_APPROVED,
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
