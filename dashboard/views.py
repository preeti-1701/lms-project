from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from courses.models import Course
from enrollment.models import Enrollment


def home(request):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.user.role == 'admin':
        return redirect('/admin/')
    if request.user.role == 'trainer':
        return redirect('dashboard:trainer_dashboard')
    return redirect('dashboard:student_dashboard')


@login_required
def student_dashboard(request):
    enrollments = request.user.enrollments.select_related('course', 'course__trainer')
    approved_enrollments = enrollments.filter(status=Enrollment.STATUS_APPROVED)
    pending_enrollments = enrollments.filter(status=Enrollment.STATUS_PENDING)
    rejected_enrollments = enrollments.filter(status=Enrollment.STATUS_REJECTED)
    return render(request, 'dashboard/student.html', {
        'user': request.user,
        'approved_enrollments': approved_enrollments,
        'pending_enrollments': pending_enrollments,
        'rejected_enrollments': rejected_enrollments,
    })

@login_required
def trainer_dashboard(request):
    courses = Course.objects.filter(trainer=request.user).prefetch_related('enrollments')
    pending_requests = Enrollment.objects.filter(
        course__trainer=request.user,
        status=Enrollment.STATUS_PENDING,
    ).select_related('student', 'course')
    return render(request, 'dashboard/trainer.html', {
        'user': request.user,
        'courses': courses,
        'pending_requests': pending_requests,
    })
