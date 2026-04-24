from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from .models import User, Course, Lesson, Enrollment
from .forms import UserRegisterForm, UserCreateForm, UserEditForm, CourseForm, LessonForm
from .decorators import role_required


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, "Invalid username or password.")
    return render(request, 'login.html')


def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Registration successful. Please log in.")
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'register.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def dashboard_view(request):
    role = request.user.role
    if role == 'admin':
        return redirect('admin_dashboard')
    elif role == 'trainer':
        return redirect('trainer_dashboard')
    elif role == 'student':
        return redirect('student_dashboard')
    return redirect('login')


# =================== ADMIN VIEWS ===================

@login_required
@role_required(['admin'])
def admin_dashboard(request):
    context = {
        'total_users': User.objects.count(),
        'total_trainers': User.objects.filter(role='trainer').count(),
        'total_students': User.objects.filter(role='student').count(),
        'total_courses': Course.objects.count(),
        'total_enrollments': Enrollment.objects.count(),
        'courses': Course.objects.select_related('trainer').prefetch_related('lessons').all(),
    }
    return render(request, 'admin/dashboard.html', context)


@login_required
@role_required(['admin'])
def manage_users(request):
    role_filter = request.GET.get('role', '')
    users = User.objects.all()
    if role_filter:
        users = users.filter(role=role_filter)
    return render(request, 'core/manage_users.html', {'users': users, 'role_filter': role_filter})


@login_required
@role_required(['admin'])
def create_user(request):
    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "User created successfully.")
            return redirect('manage_users')
    else:
        form = UserCreateForm()
    return render(request, 'core/user_form.html', {'form': form, 'title': 'Create User'})


@login_required
@role_required(['admin'])
def edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        form = UserEditForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, "User updated successfully.")
            return redirect('manage_users')
    else:
        form = UserEditForm(instance=user)
    return render(request, 'core/user_form.html', {'form': form, 'title': 'Edit User'})


@login_required
@role_required(['admin'])
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if user == request.user:
        messages.error(request, "You cannot delete yourself.")
        return redirect('manage_users')
    if request.method == 'POST':
        user.delete()
        messages.success(request, "User deleted successfully.")
        return redirect('manage_users')
    return render(request, 'core/confirm_delete.html', {'object': user, 'type': 'user'})


@login_required
@role_required(['admin'])
def create_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Course created successfully.")
            return redirect('course_list')
    else:
        form = CourseForm()
    return render(request, 'core/course_form.html', {'form': form, 'title': 'Create Course'})


@login_required
@role_required(['admin'])
def edit_course(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, "Course updated successfully.")
            return redirect('course_detail', course_id=course.course_id)
    else:
        form = CourseForm(instance=course)
    return render(request, 'core/course_form.html', {'form': form, 'title': 'Edit Course'})


@login_required
@role_required(['admin'])
def delete_course(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    if request.method == 'POST':
        course.delete()
        messages.success(request, "Course deleted successfully.")
        return redirect('course_list')
    return render(request, 'core/confirm_delete.html', {'object': course, 'type': 'course'})


@login_required
@role_required(['admin'])
def add_lesson(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.course = course
            lesson.save()
            messages.success(request, "Lesson added successfully.")
            return redirect('course_detail', course_id=course.course_id)
    else:
        form = LessonForm()
    return render(request, 'core/lesson_form.html', {'form': form, 'course': course, 'title': 'Add Lesson'})


@login_required
@role_required(['admin'])
def edit_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    if request.method == 'POST':
        form = LessonForm(request.POST, instance=lesson)
        if form.is_valid():
            form.save()
            messages.success(request, "Lesson updated successfully.")
            return redirect('course_detail', course_id=lesson.course.course_id)
    else:
        form = LessonForm(instance=lesson)
    return render(request, 'core/lesson_form.html', {'form': form, 'course': lesson.course, 'title': 'Edit Lesson'})


@login_required
@role_required(['admin'])
def delete_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course_id = lesson.course.course_id
    if request.method == 'POST':
        lesson.delete()
        messages.success(request, "Lesson deleted successfully.")
        return redirect('course_detail', course_id=course_id)
    return render(request, 'core/confirm_delete.html', {'object': lesson, 'type': 'lesson'})


@login_required
@role_required(['admin'])
def view_enrollments(request):
    enrollments = Enrollment.objects.select_related('student', 'course').all()
    return render(request, 'core/enrollments.html', {'enrollments': enrollments})


# =================== TRAINER VIEWS ===================

@login_required
@role_required(['trainer'])
def trainer_dashboard(request):
    courses = Course.objects.filter(trainer=request.user)
    return render(request, 'trainer/dashboard.html', {'courses': courses})


@login_required
@role_required(['trainer'])
def trainer_add_lesson(request, course_id):
    course = get_object_or_404(Course, course_id=course_id, trainer=request.user)
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.course = course
            lesson.save()
            messages.success(request, "Lesson added successfully.")
            return redirect('course_detail', course_id=course.course_id)
    else:
        form = LessonForm()
    return render(request, 'core/lesson_form.html', {'form': form, 'course': course, 'title': 'Add Lesson'})


@login_required
@role_required(['trainer'])
def trainer_edit_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id, course__trainer=request.user)
    if request.method == 'POST':
        form = LessonForm(request.POST, instance=lesson)
        if form.is_valid():
            form.save()
            messages.success(request, "Lesson updated successfully.")
            return redirect('course_detail', course_id=lesson.course.course_id)
    else:
        form = LessonForm(instance=lesson)
    return render(request, 'core/lesson_form.html', {'form': form, 'course': lesson.course, 'title': 'Edit Lesson'})


# =================== STUDENT VIEWS ===================

@login_required
@role_required(['student'])
def student_dashboard(request):
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    enrolled_course_ids = list(enrollments.values_list('course_id', flat=True))
    courses = Course.objects.all()
    return render(request, 'student/dashboard.html', {
        'enrollments': enrollments,
        'enrolled_course_ids': enrolled_course_ids,
        'courses': courses,
    })


@login_required
@role_required(['student'])
def enroll_course(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    if request.user.role != 'student':
        messages.error(request, "Only students can enroll.")
        return redirect('course_list')
    enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
    if created:
        messages.success(request, f"Successfully enrolled in {course.title}!")
    else:
        messages.info(request, "You are already enrolled in this course.")
    return redirect('student_dashboard')


# =================== SHARED VIEWS ===================

@login_required
def course_list(request):
    query = request.GET.get('q', '')
    courses = Course.objects.all()
    if query:
        courses = courses.filter(
            Q(title__icontains=query) | Q(course_id__icontains=query)
        )
    paginator = Paginator(courses, 6)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, 'course_list.html', {'page_obj': page_obj, 'query': query})


@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    lessons = course.lessons.all()
    is_enrolled = False
    can_edit = False
    if request.user.role == 'student':
        is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    elif request.user.role == 'trainer':
        can_edit = course.trainer == request.user
    elif request.user.role == 'admin':
        can_edit = True
    return render(request, 'course_detail.html', {
        'course': course,
        'lessons': lessons,
        'is_enrolled': is_enrolled,
        'can_edit': can_edit,
    })


@login_required
def video_player(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.course

    # Access control
    if request.user.role == 'student':
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            messages.error(request, "You must enroll to watch this video.")
            return redirect('course_detail', course_id=course.course_id)
    elif request.user.role == 'trainer':
        if course.trainer != request.user:
            messages.error(request, "You can only access your own courses.")
            return redirect('trainer_dashboard')

    # Determine next and previous lessons
    lessons = list(course.lessons.all())
    current_index = lessons.index(lesson)
    prev_lesson = lessons[current_index - 1] if current_index > 0 else None
    next_lesson = lessons[current_index + 1] if current_index < len(lessons) - 1 else None

    return render(request, 'video.html', {
        'lesson': lesson,
        'course': course,
        'prev_lesson': prev_lesson,
        'next_lesson': next_lesson,
    })

