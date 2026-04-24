from django.shortcuts import render, redirect
from .models import Course, Video
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

User = get_user_model()

@login_required
def dashboard(request):

    if request.user.role == 'trainer':
        courses = Course.objects.filter(trainer=request.user)
        students = User.objects.filter(role='student')

    elif request.user.role == 'student':
        courses = request.user.enrolled_courses.all()
        students = None

    else:
        courses = Course.objects.all()
        students = None

    return render(request, 'dashboard.html', {
        'courses': courses,
        'students': students,
    })
    