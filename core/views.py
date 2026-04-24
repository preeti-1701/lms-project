from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from .models import Enrollment, Course, Video

User = get_user_model()


# ------------------ HOME PAGE ------------------
def home(request):
    return render(request, 'home.html')


# ------------------ SIGNUP ------------------
def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')

        if User.objects.filter(username=username).exists():
            return render(request, 'signup.html', {
                'error': 'Username already exists'
            })

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role
        )

        return redirect('/login/')

    return render(request, 'signup.html')


# ------------------ LOGIN ------------------
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # ROLE BASED REDIRECT
            if user.role == 'admin':
                return redirect('/admin-panel/')
            elif user.role == 'trainer':
                return redirect('/trainer/')
            else:
                return redirect('/dashboard/')

        else:
            return render(request, 'login.html', {
                'error': 'Invalid username or password'
            })

    return render(request, 'login.html')


# ------------------ LOGOUT ------------------
def logout_view(request):
    logout(request)
    return redirect('/login/')


# ------------------ STUDENT DASHBOARD ------------------
@login_required
def dashboard(request):
    enrollments = Enrollment.objects.filter(student=request.user)

    return render(request, 'dashboard.html', {
        'enrollments': enrollments
    })


# ------------------ TRAINER DASHBOARD ------------------
@login_required
def trainer_dashboard(request):
    if request.user.role != 'trainer':
        return redirect('/dashboard/')

    courses = Course.objects.filter(trainer=request.user)

    return render(request, 'trainer_dashboard.html', {
        'courses': courses
    })


# ------------------ ADMIN PANEL ------------------
@login_required
def admin_panel(request):
    if request.user.role != 'admin':
        return redirect('/dashboard/')

    users = User.objects.all()
    courses = Course.objects.all()
    enrollments = Enrollment.objects.all()

    return render(request, 'admin_dashboard.html', {
        'users': users,
        'courses': courses,
        'enrollments': enrollments
    })

# ------------------ COURSE DETAIL ------------------
@login_required
def course_detail(request, course_id):
    course = Course.objects.get(id=course_id)
    videos = Video.objects.filter(course=course)
    return render(request, 'course_detail.html', {
        'course': course,
        'videos': videos
    })