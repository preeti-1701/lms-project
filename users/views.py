from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import User, Course
from .models import Enrollment
from .models import Video
from .models import Video , Course , Enrollment , User
from django.http import HttpResponse
from .models import Course, Video, Enrollment
from django.contrib.auth import authenticate, login
from .models import User


# LOGIN
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

from django.shortcuts import render, redirect
from .models import User

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        try:
            user = User.objects.get(email=email, password=password)

            # ✅ correct indentation (4 spaces)
            request.session['user_id'] = user.id
            request.session['role'] = user.role

            if user.role == "trainer":
                return redirect('/trainer/')
            elif user.role == "student":
                return redirect('/dashboard/')
            elif user.role == "admin":
                return redirect('/admin/')

        except:
            return HttpResponse("Invalid login ❌")

    return render(request, 'users/login.html')

# DASHBOARD
def dashboard(request):
    if request.session.get('role') != "student":
        return render(request, 'users/access_denied.html')

    return render(request, 'users/dashboard.html')

# ADD COURSE (Trainer)
def add_course(request):
    email = request.GET.get('email')
    user = User.objects.get(email=email)

    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        topics = request.POST.get('topics')
        duration = request.POST.get('duration')
        status = request.POST.get('status')

        Course.objects.create(
            title=title,
            description=description,
            trainer=user,
            topics=topics,
            duration=duration,
            status=status
        )

        return HttpResponse("Course Added ✅")

    return render(request, 'users/add_course.html', {'email': email})

# VIEW COURSES (Student)
def view_courses(request):
    courses = Course.objects.all()

    return render(request, 'users/view_courses.html', {
        'courses': courses
    })

def enroll(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Login first")

    user = User.objects.get(id=user_id)

    course_id = request.GET.get('course_id')
    course = Course.objects.get(id=course_id)

    Enrollment.objects.get_or_create(
        student=user,
        course=course
    )

    return HttpResponse("Enrolled successfully")

def my_courses(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Login first")

    user = User.objects.get(id=user_id)

    enrollments = Enrollment.objects.filter(student=user)

    return render(request, 'users/my_courses.html', {
        'enrollments': enrollments
    })

def dashboard(request):
    if request.session.get('role') != "student":
        return render(request, 'users/access_denied.html')

    return render(request, 'users/dashboard.html')

from .models import Video, Course

from django.http import HttpResponse
from .models import Video, Course, Enrollment, User

def course_videos(request, course_id):
    course = Course.objects.get(id=course_id)

    # get user from session
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Please login first")

    user = User.objects.get(id=user_id)

    is_enrolled = Enrollment.objects.filter(
        student=user,
        course=course
    ).exists()

    if not is_enrolled:
        return HttpResponse("You are not enrolled in this course")

    videos = Video.objects.filter(course=course)

    return render(request, 'users/course_videos.html', {
        'course': course,
        'videos': videos
    })

def logout_view(request):
    request.session.flush()   # clears session (logs out user)
    return redirect('/login/')  # goes back to login page

from django.contrib.auth.decorators import login_required

@login_required
def trainer_dashboard(request):
    if request.session.get('role') != "trainer":
        return render(request, 'users/access_denied.html')

    user_id = request.session.get('user_id')

    courses = Course.objects.filter(trainer_id=user_id)

    return render(request, 'trainer_dashboard.html', {
        'courses': courses
    })


def trainer_course(request, id):
    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('/login/')

    user = User.objects.get(id=user_id)

    if user.role != "trainer":
        return HttpResponse("Access Denied ❌")

    course = Course.objects.get(id=id)

    videos = Video.objects.filter(course=course)

    enrollments = Enrollment.objects.filter(course=course)
    students = [en.student for en in enrollments]

    # ADD VIDEO
    if request.method == "POST":
        title = request.POST.get('title')
        link = request.POST.get('youtube_link')

        Video.objects.create(
            title=title,
            youtube_link=link,
            course=course
        )

    return render(request, 'trainer_course.html', {
        'course': course,
        'videos': videos,
        'students': students
    })