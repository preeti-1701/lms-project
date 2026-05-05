from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Q
from django.views.decorators.clickjacking import xframe_options_exempt
from .models import Profile, Course, Enrollment


# ══════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════

def get_role(user):
    try:
        return user.profile.role
    except Exception:
        return None


def role_required(role):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if get_role(request.user) != role:
                return redirect('login')
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# ══════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        role     = request.POST.get('role', '')
        user = authenticate(request, username=username, password=password)
        if user and get_role(user) == role:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid credentials or role mismatch.')
    return render(request, 'registration/login.html')


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def dashboard(request):
    role = get_role(request.user)
    if role == 'admin':
        return redirect('admin_dashboard')
    elif role == 'student':
        return redirect('student_dashboard')
    elif role == 'trainer':
        return redirect('trainer_dashboard')
    return redirect('login')


# ══════════════════════════════════════════════
# ADMIN VIEWS
# ══════════════════════════════════════════════

@role_required('admin')
def admin_dashboard(request):
    courses        = Course.objects.all()
    active         = courses.filter(status='active').count()
    upcoming       = courses.filter(status='upcoming')
    total_enrolled = Enrollment.objects.count()
    total_users    = User.objects.count()
    return render(request, 'admin_panel/dashboard.html', {
        'courses':        courses,
        'total_courses':  courses.count(),
        'active_courses': active,
        'upcoming_courses': upcoming,
        'total_users':    total_users,
        'total_enrolled': total_enrolled,
    })


@role_required('admin')
def admin_courses(request):
    q       = request.GET.get('q', '')
    status  = request.GET.get('status', '')
    courses = Course.objects.all()
    if q:
        courses = courses.filter(Q(title__icontains=q) | Q(description__icontains=q))
    if status:
        courses = courses.filter(status=status)
    upcoming = Course.objects.filter(status='upcoming')
    trainers = User.objects.filter(profile__role='trainer')
    return render(request, 'admin_panel/courses.html', {
        'courses':  courses,
        'upcoming': upcoming,
        'trainers': trainers,
        'q':        q,
        'status':   status,
    })


@role_required('admin')
def admin_add_course(request):
    if request.method == 'POST':
        trainer_id = request.POST.get('trainer')
        trainer    = User.objects.filter(id=trainer_id).first()
        Course.objects.create(
            title       = request.POST.get('title'),
            edition     = request.POST.get('edition', ''),
            description = request.POST.get('description'),
            topics      = request.POST.get('topics', ''),
            duration    = request.POST.get('duration', ''),
            trainer     = trainer,
            status      = request.POST.get('status', 'active'),
            youtube_url = request.POST.get('youtube_url', ''),
        )
        messages.success(request, 'Course added successfully!')
    return redirect('admin_courses')


@role_required('admin')
def admin_edit_course(request, pk):
    course   = get_object_or_404(Course, pk=pk)
    trainers = User.objects.filter(profile__role='trainer')
    if request.method == 'POST':
        course.title       = request.POST.get('title')
        course.edition     = request.POST.get('edition', '')
        course.description = request.POST.get('description')
        course.topics      = request.POST.get('topics', '')
        course.duration    = request.POST.get('duration', '')
        course.status      = request.POST.get('status', 'active')
        course.youtube_url = request.POST.get('youtube_url', '')
        trainer_id = request.POST.get('trainer')
        course.trainer = User.objects.filter(id=trainer_id).first()
        course.save()
        messages.success(request, 'Course updated successfully!')
        return redirect('admin_courses')
    return render(request, 'admin_panel/edit_course.html', {
        'course':   course,
        'trainers': trainers,
    })


@role_required('admin')
def admin_delete_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    course.delete()
    messages.success(request, 'Course deleted!')
    return redirect('admin_courses')


@role_required('admin')
def admin_users(request):
    users    = User.objects.select_related('profile').all()
    trainers = users.filter(profile__role='trainer')
    courses  = Course.objects.all()
    return render(request, 'admin_panel/users.html', {
        'users':    users,
        'trainers': trainers,
        'courses':  courses,
    })


# ══════════════════════════════════════════════
# STUDENT VIEWS
# ══════════════════════════════════════════════

@role_required('student')
def student_dashboard(request):
    active       = Course.objects.filter(status='active')
    upcoming     = Course.objects.filter(status='upcoming')
    enrolled_ids = list(Enrollment.objects.filter(
                     student=request.user).values_list('course_id', flat=True))
    return render(request, 'student/dashboard.html', {
        'active_courses':   active,
        'upcoming_courses': upcoming,
        'enrolled_ids':     enrolled_ids,
        'total_courses':    Course.objects.count(),
    })


@role_required('student')
def student_courses(request):
    q       = request.GET.get('q', '')
    status  = request.GET.get('status', '')
    courses = Course.objects.all()
    if q:
        courses = courses.filter(Q(title__icontains=q) | Q(description__icontains=q))
    if status:
        courses = courses.filter(status=status)
    enrolled_ids = list(Enrollment.objects.filter(
                     student=request.user).values_list('course_id', flat=True))
    return render(request, 'student/courses.html', {
        'courses':      courses,
        'enrolled_ids': enrolled_ids,
        'q':            q,
        'status':       status,
    })


@role_required('student')
def student_enroll(request, pk):
    course = get_object_or_404(Course, pk=pk)
    Enrollment.objects.get_or_create(student=request.user, course=course)
    messages.success(request, f'Successfully enrolled in {course.title}!')
    return redirect('student_courses')


@role_required('student')
def student_watch(request, pk):
    course = get_object_or_404(Course, pk=pk)
    # Must be enrolled
    enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    if not enrolled:
        messages.error(request, 'Please enroll in this course first to watch the video.')
        return redirect('student_courses')
    embed_url = course.get_youtube_embed_url()
    if not embed_url:
        messages.error(request, 'No video available for this course yet.')
        return redirect('student_courses')
    return render(request, 'student/watch.html', {
        'course':    course,
        'embed_url': embed_url,
    })


# ══════════════════════════════════════════════
# TRAINER VIEWS
# ══════════════════════════════════════════════

@role_required('trainer')
def trainer_dashboard(request):
    my_courses     = Course.objects.filter(trainer=request.user)
    active         = my_courses.filter(status='active')
    upcoming       = my_courses.filter(status='upcoming')
    total_students = Enrollment.objects.filter(course__trainer=request.user).count()
    return render(request, 'trainer/dashboard.html', {
        'my_courses':      my_courses,
        'active_courses':  active,
        'upcoming_courses':upcoming,
        'total_students':  total_students,
    })


@role_required('trainer')
def trainer_courses(request):
    my_courses = Course.objects.filter(trainer=request.user)
    return render(request, 'trainer/courses.html', {'my_courses': my_courses})


@role_required('trainer')
def trainer_add_course(request):
    if request.method == 'POST':
        Course.objects.create(
            title       = request.POST.get('title'),
            edition     = request.POST.get('edition', ''),
            description = request.POST.get('description'),
            topics      = request.POST.get('topics', ''),
            duration    = request.POST.get('duration', ''),
            trainer     = request.user,
            status      = request.POST.get('status', 'active'),
            youtube_url = request.POST.get('youtube_url', ''),
        )
        messages.success(request, 'Course added successfully!')
    return redirect('trainer_courses')


# ══════════════════════════════════════════════
# PROFILE
# ══════════════════════════════════════════════

@login_required
def profile(request):
    role     = get_role(request.user)
    assigned = Course.objects.filter(trainer=request.user) if role == 'trainer' else []
    enrolled = Enrollment.objects.filter(
                 student=request.user).select_related('course') if role == 'student' else []
    return render(request, 'profile.html', {
        'role':     role,
        'assigned': assigned,
        'enrolled': enrolled,
    })
