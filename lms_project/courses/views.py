from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from .models import Course, Video

User = get_user_model()

@login_required(login_url='login')
def dashboard(request):
    user = request.user
    is_admin = user.role == 'admin' or user.is_superuser

    if request.method == 'POST':

        if 'add_course' in request.POST and is_admin:
            title = request.POST.get('title')
            if title:
                Course.objects.create(title=title, created_by=user)

        elif 'update_course' in request.POST and is_admin:
            course_id = request.POST.get('course_id')
            title = request.POST.get('title')
            if title:
                course = get_object_or_404(Course, id=course_id)
                course.title = title
                course.save()

        elif 'delete_course' in request.POST and is_admin:
            course_id = request.POST.get('course_id')
            get_object_or_404(Course, id=course_id).delete()

        elif 'assign_trainer' in request.POST and is_admin:
            course_id = request.POST.get('course_id')
            trainer_id = request.POST.get('trainer_id')
            course = get_object_or_404(Course, id=course_id)
            trainer = get_object_or_404(User, id=trainer_id, role='trainer')
            course.trainer = trainer
            course.save()

        elif 'assign_student' in request.POST and is_admin:
            course_id = request.POST.get('course_id')
            student_id = request.POST.get('student_id')
            course = get_object_or_404(Course, id=course_id)
            student = get_object_or_404(User, id=student_id, role='student')
            course.students.add(student)

        elif 'add_video' in request.POST and user.role == 'trainer':
            course_id = request.POST.get('course_id')
            title = request.POST.get('video_title')
            link = request.POST.get('youtube_link')
            if title and link:
                # trainer can only add to courses assigned to them
                course = get_object_or_404(Course, id=course_id, trainer=user)
                Video.objects.create(course=course, title=title, youtube_link=link)

        return redirect('dashboard')

    # GET
    if is_admin:
        courses = Course.objects.all()
        students = User.objects.filter(role='student')
        trainers = User.objects.filter(role='trainer')
    elif user.role == 'trainer':
        courses = Course.objects.filter(trainer=user)
        students = None
        trainers = None
    elif user.role == 'student':
        courses = user.enrolled_courses.all()
        students = None
        trainers = None
    else:
        courses = []
        students = None
        trainers = None

    return render(request, 'dashboard.html', {
        'courses': courses,
        'students': students,
        'trainers': trainers,
        'is_admin': is_admin,
    })