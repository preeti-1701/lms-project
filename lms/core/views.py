from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages

from .models import Course, Video


def user_login(request):
    if request.method == 'POST':
        identifier = request.POST.get('username')
        password = request.POST.get('password')

        user = None

        try:
            user_obj = User.objects.get(email=identifier)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = authenticate(request, username=identifier, password=password)

        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid credentials')

    return render(request, 'login.html')


@login_required
def dashboard(request):
    courses = Course.objects.all()
    return render(request, 'dashboard.html', {'courses': courses})


@login_required
def course_detail(request, id):
    course = get_object_or_404(Course, id=id)
    videos = Video.objects.filter(course=course)

    return render(request, 'course.html', {
        'course': course,
        'videos': videos
    })


@login_required
def profile(request):
    return render(request, 'profile.html')


def user_logout(request):
    logout(request)
    return redirect('login')