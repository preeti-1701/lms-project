from django.shortcuts import render, redirect
from enrollments.models import Enrollment
from courses.models import Course
from django.contrib.auth import get_user_model

User = get_user_model()


# 🏠 HOME
def home(request):
    return render(request, 'core/home.html')


# 👨‍🎓 STUDENT DASHBOARD
def student_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return redirect('home')

    enrollments = Enrollment.objects.filter(student=request.user)

    return render(request, 'core/student_dashboard.html', {
        'enrollments': enrollments
    })


# 👨‍🏫 TRAINER DASHBOARD
def trainer_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'trainer':
        return redirect('home')

    courses = Course.objects.filter(trainer=request.user)

    return render(request, 'core/trainer_dashboard.html', {
        'courses': courses
    })


# 🧑‍💼 ADMIN DASHBOARD
def admin_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return redirect('home')

    courses = Course.objects.all()
    users = User.objects.all()
    enrollments = Enrollment.objects.all()

    return render(request, 'core/admin_dashboard.html', {
        'courses': courses,
        'users': users,
        'enrollments': enrollments
    })


# 🚫 UNAUTHORIZED
def unauthorized(request):
    return render(request, 'core/unauthorized.html')

def course_detail(request, course_id):
    from courses.models import Course

    course = Course.objects.get(id=course_id)

    return render(request, 'core/course_detail.html', {
        'course': course
    })