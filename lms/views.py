from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm

from .models import Course, Enrollment, Progress, Video


# =========================
# 🔐 ROLE HELPERS (SAFE)
# =========================
def is_trainer(user):
    return user.is_authenticated and getattr(user, 'role', None) == 'trainer'

def is_student(user):
    return user.is_authenticated and getattr(user, 'role', None) == 'student'

def is_admin(user):
    return user.is_authenticated and getattr(user, 'role', None) == 'admin'


# =========================
# 🔑 LOGIN
# =========================
def custom_login(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    form = AuthenticationForm(request, data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        login(request, user)

        if user.role == 'admin':
            return redirect('/admin/')
        elif user.role == 'trainer':
            return redirect('trainer_dashboard')
        elif user.role == 'student':
            return redirect('student_dashboard')
        else:
            return redirect('home')

    return render(request, 'registration/login.html', {'form': form})


# =========================
# 🔓 LOGOUT
# =========================
def custom_logout(request):
    logout(request)
    return redirect('login')


# =========================
# 🏠 HOME
# =========================
def home(request):
    courses = Course.objects.all()
    return render(request, 'home.html', {'courses': courses})


# =========================
# 🔑 DASHBOARD ROUTER
# =========================
@login_required
def dashboard(request):
    if is_admin(request.user):
        return redirect('/admin/')
    elif is_trainer(request.user):
        return redirect('trainer_dashboard')
    else:
        return redirect('student_dashboard')


# =========================
# 🎓 STUDENT DASHBOARD
# =========================
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Enrollment, Progress

def is_student(user):
    return user.is_authenticated and getattr(user, 'role', None) == 'student'


@login_required
def student_dashboard(request):
    if not is_student(request.user):
        return redirect('home')

    # 🔒 ONLY THIS STUDENT'S ENROLLMENTS
    enrollments = Enrollment.objects.filter(student=request.user)

    course_data = []

    for enrollment in enrollments:
        course = enrollment.course

        total_videos = course.videos.count()

        completed_videos = Progress.objects.filter(
            student=request.user,
            course=course,
            completed=True
        ).count()

        progress_percent = 0
        if total_videos > 0:
            progress_percent = int((completed_videos / total_videos) * 100)

        course_data.append({
            "course": course,
            "progress": progress_percent
        })

    return render(request, 'student_dashboard.html', {
        'course_data': course_data,
        'total_courses': enrollments.count(),
        'user': request.user
    })
# =========================
# 🎓 ENROLL COURSE
# =========================
@login_required
def enroll_course(request, course_id):
    if not is_student(request.user):
        return redirect('home')

    course = get_object_or_404(Course, id=course_id)

    Enrollment.objects.get_or_create(
        student=request.user,
        course=course
    )

    return redirect('course_detail', course_id=course.id)


# =========================
# 📚 COURSE DETAIL
# =========================
@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    if is_student(request.user):
        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course
        ).exists()

        if not is_enrolled:
            return redirect('home')

    videos = course.videos.all()

    progress_records = Progress.objects.filter(
        student=request.user,
        course=course
    )

    progress_data = {p.video_id: p.completed for p in progress_records}

    completed = sum(1 for v in progress_data.values() if v)
    total = videos.count()

    progress_percent = 0
    if total > 0:
        progress_percent = int((completed / total) * 100)

    return render(request, 'course_detail.html', {
        'course': course,
        'videos': videos,
        'progress_data': progress_data,
        'progress_percent': progress_percent
    })


# =========================
# 🎓 STUDENT COURSES (REDIRECT)
# =========================
@login_required
def my_courses(request):
    return redirect('student_dashboard')


# =========================
# ✔ MARK COMPLETE
# =========================
@login_required
def mark_complete(request, video_id):
    video = get_object_or_404(Video, id=video_id)

    obj, created = Progress.objects.get_or_create(
        student=request.user,
        course=video.course,
        video=video,
        defaults={'completed': True}
    )

    if not created:
        obj.completed = True
        obj.save()

    return redirect('course_detail', course_id=video.course.id)


# =========================
# 🧑‍🏫 TRAINER DASHBOARD
# =========================
@login_required
def trainer_dashboard(request):
    if not is_trainer(request.user):
        return redirect('home')

    courses = Course.objects.filter(created_by=request.user)

    return render(request, 'trainer_dashboard.html', {
        'courses': courses
    })


# =========================
# ➕ CREATE COURSE
# =========================
@login_required
def create_course(request):
    if not is_trainer(request.user):
        return redirect('home')

    if request.method == 'POST':
        Course.objects.create(
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            created_by=request.user
        )
        return redirect('trainer_dashboard')

    return render(request, 'create_course.html')