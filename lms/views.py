from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse
from .models import User, Course, Lesson, Enrollment, LessonProgress, Category, UserSession
from .forms import RegisterForm, LoginForm, CourseForm, LessonForm, EnrollmentForm, CategoryForm
from .decorators import role_required


def home(request):
    if request.user.is_authenticated:
        role = request.user.role
        if role == 'admin':
            return redirect('admin_dashboard')
        elif role == 'trainer':
            return redirect('trainer_dashboard')
        else:
            return redirect('student_dashboard')
    return redirect('login')


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            _set_user_session(request, user)
            messages.success(request, f'Welcome, {user.first_name}! Account created successfully.')
            return redirect('home')
        else:
            messages.error(request, 'Please fix the errors below.')
    else:
        form = RegisterForm()
    return render(request, 'lms/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            # Single session enforcement
            _enforce_single_session(request, user)
            login(request, user)
            _set_user_session(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password.')
    else:
        form = LoginForm()
    return render(request, 'lms/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')


def _set_user_session(request, user):
    try:
        UserSession.objects.update_or_create(
            user=user,
            defaults={'session_key': request.session.session_key or ''}
        )
    except Exception:
        pass


def _enforce_single_session(request, user):
    try:
        existing = UserSession.objects.get(user=user)
        from django.contrib.sessions.models import Session
        try:
            old_session = Session.objects.get(session_key=existing.session_key)
            old_session.delete()
        except Session.DoesNotExist:
            pass
        existing.delete()
    except UserSession.DoesNotExist:
        pass


# ─── ADMIN VIEWS ────────────────────────────────────────────────────────────

@login_required
@role_required('admin')
def admin_dashboard(request):
    context = {
        'total_students': User.objects.filter(role='student').count(),
        'total_trainers': User.objects.filter(role='trainer').count(),
        'total_courses': Course.objects.count(),
        'total_enrollments': Enrollment.objects.filter(is_active=True).count(),
        'recent_courses': Course.objects.order_by('-created_at')[:5],
        'recent_enrollments': Enrollment.objects.order_by('-enrolled_at')[:5],
    }
    return render(request, 'lms/admin_dashboard.html', context)


@login_required
@role_required('admin')
def manage_users(request):
    users = User.objects.all().order_by('role', 'username')
    return render(request, 'lms/manage_users.html', {'users': users})


@login_required
@role_required('admin')
def toggle_user(request, pk):
    user = get_object_or_404(User, pk=pk)
    if user != request.user:
        user.is_active = not user.is_active
        user.save()
        messages.success(request, f'User {user.username} {"activated" if user.is_active else "deactivated"}.')
    return redirect('manage_users')


@login_required
@role_required('admin')
def manage_courses(request):
    courses = Course.objects.all().order_by('-created_at')
    return render(request, 'lms/manage_courses.html', {'courses': courses})


@login_required
@role_required('admin')
def create_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Course created successfully.')
            return redirect('manage_courses')
    else:
        form = CourseForm()
    return render(request, 'lms/course_form.html', {'form': form, 'action': 'Create'})


@login_required
@role_required('admin')
def edit_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, 'Course updated successfully.')
            return redirect('manage_courses')
    else:
        form = CourseForm(instance=course)
    return render(request, 'lms/course_form.html', {'form': form, 'action': 'Edit', 'course': course})


@login_required
@role_required('admin')
def delete_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        course.delete()
        messages.success(request, 'Course deleted.')
        return redirect('manage_courses')
    return render(request, 'lms/confirm_delete.html', {'object': course, 'type': 'Course'})


@login_required
@role_required('admin')
def manage_lessons(request, course_pk):
    course = get_object_or_404(Course, pk=course_pk)
    lessons = course.lessons.all()
    return render(request, 'lms/manage_lessons.html', {'course': course, 'lessons': lessons})


@login_required
@role_required('admin')
def create_lesson(request, course_pk):
    course = get_object_or_404(Course, pk=course_pk)
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.course = course
            lesson.save()
            messages.success(request, 'Lesson added successfully.')
            return redirect('manage_lessons', course_pk=course.pk)
    else:
        form = LessonForm()
    return render(request, 'lms/lesson_form.html', {'form': form, 'course': course, 'action': 'Add'})


@login_required
@role_required('admin')
def edit_lesson(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    if request.method == 'POST':
        form = LessonForm(request.POST, instance=lesson)
        if form.is_valid():
            form.save()
            messages.success(request, 'Lesson updated.')
            return redirect('manage_lessons', course_pk=lesson.course.pk)
    else:
        form = LessonForm(instance=lesson)
    return render(request, 'lms/lesson_form.html', {'form': form, 'course': lesson.course, 'action': 'Edit'})


@login_required
@role_required('admin')
def delete_lesson(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    course_pk = lesson.course.pk
    if request.method == 'POST':
        lesson.delete()
        messages.success(request, 'Lesson deleted.')
        return redirect('manage_lessons', course_pk=course_pk)
    return render(request, 'lms/confirm_delete.html', {'object': lesson, 'type': 'Lesson'})


@login_required
@role_required('admin')
def manage_enrollments(request):
    enrollments = Enrollment.objects.all().order_by('-enrolled_at')
    if request.method == 'POST':
        form = EnrollmentForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Student enrolled successfully.')
            except IntegrityError:
                messages.error(request, 'Student is already enrolled in this course.')
            return redirect('manage_enrollments')
    else:
        form = EnrollmentForm()
    return render(request, 'lms/manage_enrollments.html', {'enrollments': enrollments, 'form': form})


@login_required
@role_required('admin')
def remove_enrollment(request, pk):
    enrollment = get_object_or_404(Enrollment, pk=pk)
    enrollment.delete()
    messages.success(request, 'Enrollment removed.')
    return redirect('manage_enrollments')


# ─── TRAINER VIEWS ──────────────────────────────────────────────────────────

@login_required
@role_required('trainer')
def trainer_dashboard(request):
    courses = Course.objects.filter(trainer=request.user)
    context = {
        'courses': courses,
        'total_courses': courses.count(),
        'total_students': Enrollment.objects.filter(course__trainer=request.user, is_active=True).values('student').distinct().count(),
        'total_lessons': Lesson.objects.filter(course__trainer=request.user).count(),
    }
    return render(request, 'lms/trainer_dashboard.html', context)


@login_required
@role_required('trainer')
def trainer_course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk, trainer=request.user)
    lessons = course.lessons.all()
    enrollments = course.enrollments.filter(is_active=True)
    return render(request, 'lms/trainer_course_detail.html', {
        'course': course, 'lessons': lessons, 'enrollments': enrollments
    })


# ─── STUDENT VIEWS ──────────────────────────────────────────────────────────

@login_required
@role_required('student')
def student_dashboard(request):
    enrollments = Enrollment.objects.filter(student=request.user, is_active=True).select_related('course')
    return render(request, 'lms/student_dashboard.html', {'enrollments': enrollments})


@login_required
@role_required('student')
def student_course_detail(request, pk):
    enrollment = get_object_or_404(Enrollment, course__pk=pk, student=request.user, is_active=True)
    course = enrollment.course
    lessons = course.lessons.all()
    progress_map = {}
    for lp in LessonProgress.objects.filter(enrollment=enrollment):
        progress_map[lp.lesson_id] = lp.completed
    return render(request, 'lms/student_course_detail.html', {
        'course': course,
        'lessons': lessons,
        'enrollment': enrollment,
        'progress_map': progress_map,
        'progress_percent': enrollment.progress_percent(),
    })


@login_required
@role_required('student')
def watch_lesson(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    enrollment = get_object_or_404(Enrollment, course=lesson.course, student=request.user, is_active=True)
    lp, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
    return render(request, 'lms/watch_lesson.html', {
        'lesson': lesson,
        'enrollment': enrollment,
        'lp': lp,
    })


@login_required
@role_required('student')
def mark_lesson_complete(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    enrollment = get_object_or_404(Enrollment, course=lesson.course, student=request.user, is_active=True)
    lp, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
    lp.mark_complete()
    messages.success(request, f'"{lesson.title}" marked as complete!')
    return redirect('student_course_detail', pk=lesson.course.pk)
