from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Course, Lesson, Enrollment, LessonProgress, Category, UserProfile
from .forms import RegisterForm, LoginForm, CourseForm, LessonForm, ProfileForm


# ─────────────────────────────────────────────
#  AUTH
# ─────────────────────────────────────────────

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    form = RegisterForm()
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            is_instructor = form.cleaned_data.get('is_instructor', False)
            UserProfile.objects.create(user=user, is_instructor=is_instructor)
            login(request, user)
            messages.success(request, f'Welcome, {user.first_name}! Your account is ready.')
            return redirect('dashboard')
    return render(request, 'elearning/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    form = LoginForm()
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(
                request,
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password']
            )
            if user:
                login(request, user)
                return redirect(request.GET.get('next', 'dashboard'))
            else:
                messages.error(request, 'Invalid username or password.')
    return render(request, 'elearning/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


# ─────────────────────────────────────────────
#  DASHBOARD
# ─────────────────────────────────────────────

@login_required
def dashboard_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    taught_courses = Course.objects.filter(instructor=request.user) if profile.is_instructor else []
    all_courses = Course.objects.filter(is_published=True).order_by('-created_at')[:6]
    categories = Category.objects.all()
    context = {
        'profile': profile,
        'enrollments': enrollments,
        'taught_courses': taught_courses,
        'all_courses': all_courses,
        'categories': categories,
    }
    return render(request, 'elearning/dashboard.html', context)


# ─────────────────────────────────────────────
#  COURSES
# ─────────────────────────────────────────────

def course_list_view(request):
    query = request.GET.get('q', '')
    category_id = request.GET.get('category', '')
    level = request.GET.get('level', '')
    courses = Course.objects.filter(is_published=True)
    if query:
        courses = courses.filter(Q(title__icontains=query) | Q(description__icontains=query))
    if category_id:
        courses = courses.filter(category_id=category_id)
    if level:
        courses = courses.filter(level=level)
    categories = Category.objects.all()
    context = {
        'courses': courses,
        'categories': categories,
        'query': query,
        'selected_category': category_id,
        'selected_level': level,
    }
    return render(request, 'elearning/course_list.html', context)


def course_detail_view(request, pk):
    course = get_object_or_404(Course, pk=pk, is_published=True)
    lessons = course.lessons.all()
    is_enrolled = False
    enrollment = None
    lesson_progress = {}
    if request.user.is_authenticated:
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        is_enrolled = enrollment is not None
        if enrollment:
            for lp in LessonProgress.objects.filter(enrollment=enrollment):
                lesson_progress[lp.lesson_id] = lp.completed
    context = {
        'course': course,
        'lessons': lessons,
        'is_enrolled': is_enrolled,
        'enrollment': enrollment,
        'lesson_progress': lesson_progress,
    }
    return render(request, 'elearning/course_detail.html', context)


@login_required
def enroll_view(request, pk):
    course = get_object_or_404(Course, pk=pk, is_published=True)
    enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
    if created:
        messages.success(request, f'Successfully enrolled in "{course.title}"!')
    else:
        messages.info(request, 'You are already enrolled in this course.')
    return redirect('course_detail', pk=pk)


@login_required
def lesson_view(request, course_pk, lesson_pk):
    course = get_object_or_404(Course, pk=course_pk)
    lesson = get_object_or_404(Lesson, pk=lesson_pk, course=course)
    enrollment = get_object_or_404(Enrollment, student=request.user, course=course)
    lessons = course.lessons.all()
    # Mark lesson as completed
    lp, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
    lp.completed = True
    lp.save()

    # Navigation
    lesson_list = list(lessons)
    current_idx = next((i for i, l in enumerate(lesson_list) if l.pk == lesson.pk), 0)
    prev_lesson = lesson_list[current_idx - 1] if current_idx > 0 else None
    next_lesson = lesson_list[current_idx + 1] if current_idx < len(lesson_list) - 1 else None

    lesson_progress = {lp.lesson_id: lp.completed for lp in LessonProgress.objects.filter(enrollment=enrollment)}

    context = {
        'course': course,
        'lesson': lesson,
        'lessons': lessons,
        'prev_lesson': prev_lesson,
        'next_lesson': next_lesson,
        'enrollment': enrollment,
        'lesson_progress': lesson_progress,
        'progress_percent': enrollment.progress_percent(),
    }
    return render(request, 'elearning/lesson.html', context)


# ─────────────────────────────────────────────
#  INSTRUCTOR VIEWS
# ─────────────────────────────────────────────

@login_required
def create_course_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if not profile.is_instructor:
        messages.error(request, 'You need an instructor account to create courses.')
        return redirect('dashboard')
    form = CourseForm()
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save(commit=False)
            course.instructor = request.user
            course.save()
            messages.success(request, f'Course "{course.title}" created successfully!')
            return redirect('manage_course', pk=course.pk)
    return render(request, 'elearning/course_form.html', {'form': form, 'action': 'Create'})


@login_required
def manage_course_view(request, pk):
    course = get_object_or_404(Course, pk=pk, instructor=request.user)
    lessons = course.lessons.all()
    lesson_form = LessonForm()
    if request.method == 'POST':
        lesson_form = LessonForm(request.POST)
        if lesson_form.is_valid():
            lesson = lesson_form.save(commit=False)
            lesson.course = course
            lesson.save()
            messages.success(request, f'Lesson "{lesson.title}" added!')
            return redirect('manage_course', pk=pk)
    context = {
        'course': course,
        'lessons': lessons,
        'lesson_form': lesson_form,
    }
    return render(request, 'elearning/manage_course.html', context)


@login_required
def edit_course_view(request, pk):
    course = get_object_or_404(Course, pk=pk, instructor=request.user)
    form = CourseForm(instance=course)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, 'Course updated successfully!')
            return redirect('manage_course', pk=pk)
    return render(request, 'elearning/course_form.html', {'form': form, 'action': 'Edit', 'course': course})


@login_required
def delete_lesson_view(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk, course__instructor=request.user)
    course_pk = lesson.course.pk
    lesson.delete()
    messages.success(request, 'Lesson deleted.')
    return redirect('manage_course', pk=course_pk)


# ─────────────────────────────────────────────
#  PROFILE
# ─────────────────────────────────────────────

@login_required
def profile_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    form = ProfileForm(instance=profile)
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated!')
            return redirect('profile')
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    context = {
        'profile': profile,
        'form': form,
        'enrollments': enrollments,
    }
    return render(request, 'elearning/profile.html', context)
