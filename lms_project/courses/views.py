from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from .models import Course, Video

User = get_user_model()

@login_required(login_url='login')
def dashboard(request):
    user = request.user

    
    if request.method == 'POST':

        if 'add_course' in request.POST and user.role == 'trainer':
            title = request.POST.get('title')
            if title:
                Course.objects.create(title=title, trainer=user)

        elif 'update_course' in request.POST and user.role == 'trainer':
            course_id = request.POST.get('course_id')
            title = request.POST.get('title')
            if title:
                course = get_object_or_404(Course, id=course_id, trainer=user)
                course.title = title
                course.save()

        elif 'delete_course' in request.POST and user.role == 'trainer':
            course_id = request.POST.get('course_id')
            course = get_object_or_404(Course, id=course_id, trainer=user)
            course.delete()

        elif 'assign_student' in request.POST and user.role == 'trainer':
            course_id = request.POST.get('course_id')
            student_id = request.POST.get('student_id')
            course = get_object_or_404(Course, id=course_id, trainer=user)
            student = get_object_or_404(User, id=student_id, role='student')
            course.students.add(student)

        elif 'add_video' in request.POST and user.role == 'trainer':
            course_id = request.POST.get('course_id')
            title = request.POST.get('video_title')
            link = request.POST.get('youtube_link')
            if title and link:
                course = get_object_or_404(Course, id=course_id, trainer=user)
                Video.objects.create(course=course, title=title, youtube_link=link)

        return redirect('dashboard')  

    # role based
    if user.is_superuser or user.role == 'admin':
        courses = Course.objects.all()
        students = User.objects.filter(role='student')

    elif user.role == 'trainer':
        courses = Course.objects.filter(trainer=user)
        students = User.objects.filter(role='student')

    elif user.role == 'student':
        courses = user.enrolled_courses.all()
        students = None

    else:
        courses = []
        students = None

    return render(request, 'dashboard.html', {
        'courses': courses,
        'students': students,
    })