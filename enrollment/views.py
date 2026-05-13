from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from courses.models import Course
from .models import Enrollment
from users.utils import generate_certificate

@login_required
def enroll_course(request, course_id):
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
    enrollment = get_object_or_404(Enrollment, id=enrollment_id, student=request.user)
    # Simulate progress (you can enhance with video watch time later)
    enrollment.progress = 100
    enrollment.completed = True
    if not enrollment.certificate_issued:
        cert_path = generate_certificate(enrollment)
        enrollment.certificate_file = cert_path
        enrollment.certificate_issued = True
    enrollment.save()
    messages.success(request, "Course Completed! Certificate Generated.")
    return redirect('course_detail', pk=enrollment.course.id)