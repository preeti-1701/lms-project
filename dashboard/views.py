from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required
from django.contrib import messages
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
    if request.user.role != 'trainer':
        messages.error(request, "Only trainers can access the trainer dashboard.")
        return redirect('dashboard:student_dashboard')

    courses = Course.objects.filter(trainer=request.user).annotate(
        approved_students_count=Count(
            'enrollments',
            filter=Q(enrollments__status=Enrollment.STATUS_APPROVED),
        ),
        pending_requests_count=Count(
            'enrollments',
            filter=Q(enrollments__status=Enrollment.STATUS_PENDING),
        ),
        rejected_requests_count=Count(
            'enrollments',
            filter=Q(enrollments__status=Enrollment.STATUS_REJECTED),
        ),
    )
    pending_requests = Enrollment.objects.filter(
        course__trainer=request.user,
        status=Enrollment.STATUS_PENDING,
    ).select_related('student', 'course')
    return render(request, 'dashboard/trainer.html', {
        'user': request.user,
        'courses': courses,
        'pending_requests': pending_requests,
    })


@login_required
def course_enrollments(request, course_id):
    if request.user.role != 'trainer':
        messages.error(request, "Only trainers can manage course enrollments.")
        return redirect('course_list')

    course = get_object_or_404(Course, id=course_id, trainer=request.user)
    enrollments = course.enrollments.select_related('student').order_by('status', '-requested_at')

    return render(request, 'dashboard/course_enrollments.html', {
        'course': course,
        'enrollments': enrollments,
        'approved_count': enrollments.filter(status=Enrollment.STATUS_APPROVED).count(),
        'pending_count': enrollments.filter(status=Enrollment.STATUS_PENDING).count(),
        'rejected_count': enrollments.filter(status=Enrollment.STATUS_REJECTED).count(),
    })
