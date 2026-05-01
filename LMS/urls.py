from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from courses.models import Course
from users.models import Student

def home(request):
    return render(request, 'home.html')

def courses_view(request):
    courses = Course.objects.all()
    return render(request, 'courses.html', {'courses': courses})

def users_view(request):
    users = Student.objects.all()
    return render(request, 'users.html', {'users': users})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    path('courses/', courses_view),
    path('users/', users_view),
]