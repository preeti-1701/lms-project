from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import Course

def user_login(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # DEBUG (TEMP)
            print("ROLE:", user.role)

            if user.role == 'admin':
                return redirect('admin_dashboard')
            elif user.role == 'trainer':
                return redirect('trainer_dashboard')
            elif user.role == 'student':
                return redirect('student_dashboard')
            else:
                return redirect('login')

        else:
            messages.error(request, "Invalid credentials")

    return render(request, 'core/login.html')

def user_logout(request):
    logout(request)
    return redirect('login')

def admin_dashboard(request):
    if request.user.role == 'admin':
        return render(request, 'admin_dashboard.html')
    return redirect('login')

def trainer_dashboard(request):
    if request.user.role != 'trainer':
        return redirect('login')

    courses = Course.objects.filter(trainer=request.user)

    return render(request, 'trainer_dashboard.html', {
        'courses': courses
    })

def student_dashboard(request):
    if request.user.role != 'student':
        return redirect('login')

    courses = request.user.courses.all()

    return render(request, 'student_dashboard.html', {
        'courses': courses
    })

def course_detail(request, id):
    course = Course.objects.get(id=id)
    videos = course.video_set.all()

    return render(request, 'course_detail.html', {
        'course': course,
        'videos': videos
    })