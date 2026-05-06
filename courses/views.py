from django.shortcuts import render, get_object_or_404, redirect
from .models import Course, Lesson, Enrollment
from users.models import User

def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    lessons = Lesson.objects.filter(course=course)

    return render(request, 'course_detail.html', {
        'course': course,
        'lessons': lessons
    })

def student_dashboard(request):
    user_name = request.session.get('user_name')
    user = User.objects.filter(name=user_name).first()

    if not user:
        return render(request, 'student.html', {
            'enrollments': [],
            'user_name': "Guest",
            'total_courses': 0,
            'progress': 0
        })

    enrollments = Enrollment.objects.filter(student=user)

    total_courses = enrollments.count()

    progress = 0   # simple for now

    return render(request, 'student.html', {
        'enrollments': enrollments,
        'user_name': user.name,
        'total_courses': total_courses,
        'progress': progress
    })

def create_course(request):
    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        trainer_id = request.POST.get('trainer')

        trainer = User.objects.get(id=trainer_id)

        Course.objects.create(
            title=title,
            description=description,
            trainer=trainer
        )

        return redirect('/admin_dashboard/')

    trainers = User.objects.filter(role='trainer')

    return render(request, 'create_course.html', {
        'trainers': trainers
    })

def assign_student(request):
    if request.method == "POST":
        student_id = request.POST.get('student')
        course_id = request.POST.get('course')

        student = User.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)

        Enrollment.objects.create(
            student=student,
            course=course
        )

        return redirect('/admin_dashboard/')

    students = User.objects.filter(role='student')
    courses = Course.objects.all()

    return render(request, 'assign_student.html', {
        'students': students,
        'courses': courses
    })

def add_video(request, course_id):
    course = Course.objects.get(id=course_id)

    if request.method == "POST":
        title = request.POST.get('title')
        url = request.POST.get('url')

        Lesson.objects.create(
            course=course,
            title=title,
            video_url=url
        )

        return redirect('/admin_dashboard/')

    return render(request, 'add_video.html', {'course': course})