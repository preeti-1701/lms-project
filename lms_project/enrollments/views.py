from django.shortcuts import render, redirect
from .models import Enrollment
from django.contrib.auth import get_user_model
from courses.models import Course

User = get_user_model()

def enroll_student(request):
    if request.user.role != 'admin':
        return redirect('home')

    students = User.objects.filter(role='student')
    courses = Course.objects.all()

    if request.method == "POST":
        student_id = request.POST['student']
        course_id = request.POST['course']

        student = User.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)

        Enrollment.objects.get_or_create(student=student, course=course)

        return redirect('admin_dashboard')

    return render(request, 'enrollments/enroll.html', {
        'students': students,
        'courses': courses
    })