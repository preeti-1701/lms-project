from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from .models import Course

from django.contrib.auth.models import User
from django.contrib import messages

def home(request):
    courses = Course.objects.all()
    return render(request, 'home.html', {'courses': courses})


def user_login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect('home')

    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect('login')


def course_detail(request, id):
    course = get_object_or_404(Course, id=id)
    return render(request, 'course_detail.html', {'course': course})



def register(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return redirect('register')

        user = User.objects.create_user(username=username, password=password)
        user.save()

        messages.success(request, "Account created successfully")
        return redirect('login')

    return render(request, 'register.html')

from .models import CourseProgress

def mark_complete(request, id):
    course = Course.objects.get(id=id)

    CourseProgress.objects.get_or_create(
        user=request.user,
        course=course,
        completed=True
    )

    return redirect('home')