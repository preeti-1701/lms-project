from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session
from django.core.exceptions import PermissionDenied
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from .forms import CourseForm, LessonForm, LoginForm, UserForm
from .models import Course, Lesson, User, UserSession


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def create_tracked_session(request, user):
    request.session.cycle_key()
    old = UserSession.objects.filter(user=user).first()
    if old and old.session_key:
        Session.objects.filter(session_key=old.session_key).delete()
    UserSession.objects.update_or_create(
        user=user,
        defaults={
            'session_key': request.session.session_key,
            'ip_address': client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:1000],
            'force_logged_out': False,
            'last_seen': timezone.now(),
        },
    )


def require_admin(user):
    if not user.is_admin_role:
        raise PermissionDenied


def require_manager(user):
    if not (user.is_admin_role or user.is_trainer_role):
        raise PermissionDenied


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    form = LoginForm(request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        auth.login(request, user)
        create_tracked_session(request, user)
        messages.success(request, f'Welcome back, {user.first_name or user.username}.')
        return redirect('dashboard')
    return render(request, 'core/login.html', {'form': form})


def logout_view(request):
    if request.user.is_authenticated:
        UserSession.objects.filter(user=request.user).update(force_logged_out=True)
    auth.logout(request)
    return redirect('login')


@login_required
def dashboard(request):
    user = request.user
    if user.is_admin_role:
        context = {
            'user_count': User.objects.count(),
            'student_count': User.objects.filter(role=User.Roles.STUDENT).count(),
            'course_count': Course.objects.count(),
            'session_count': UserSession.objects.filter(force_logged_out=False).count(),
            'courses': Course.objects.annotate(lesson_count=Count('lessons'))[:6],
            'sessions': UserSession.objects.select_related('user').order_by('-last_seen')[:8],
        }
        return render(request, 'core/dashboard_admin.html', context)
    if user.is_trainer_role:
        courses = Course.objects.filter(trainer=user).annotate(lesson_count=Count('lessons'))
        return render(request, 'core/dashboard_trainer.html', {'courses': courses})
    courses = user.assigned_courses.filter(is_published=True).annotate(lesson_count=Count('lessons'))
    return render(request, 'core/dashboard_student.html', {'courses': courses})


@login_required
def user_list(request):
    require_admin(request.user)
    users = User.objects.all().order_by('role', 'first_name', 'username')
    sessions = {s.user_id: s for s in UserSession.objects.all()}
    return render(request, 'core/user_list.html', {'users': users, 'sessions': sessions})


@login_required
def user_form(request, pk=None):
    require_admin(request.user)
    instance = get_object_or_404(User, pk=pk) if pk else None
    form = UserForm(request.POST or None, instance=instance)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        messages.success(request, f'{user.get_full_name() or user.username} was saved.')
        return redirect('user_list')
    return render(request, 'core/form.html', {'form': form, 'title': 'Edit user' if instance else 'Create user'})


@login_required
def force_logout(request, pk):
    require_admin(request.user)
    user = get_object_or_404(User, pk=pk)
    tracked = UserSession.objects.filter(user=user).first()
    if tracked:
        Session.objects.filter(session_key=tracked.session_key).delete()
        tracked.force_logged_out = True
        tracked.save(update_fields=['force_logged_out'])
        messages.success(request, f'{user.username} has been logged out.')
    return redirect('user_list')


@login_required
def course_list(request):
    if request.user.is_admin_role:
        courses = Course.objects.all()
    elif request.user.is_trainer_role:
        courses = Course.objects.filter(trainer=request.user)
    else:
        courses = request.user.assigned_courses.filter(is_published=True)
    return render(request, 'core/course_list.html', {'courses': courses.annotate(lesson_count=Count('lessons'))})


@login_required
def course_detail(request, pk):
    course = get_object_or_404(Course.objects.prefetch_related('lessons', 'students'), pk=pk)
    allowed = (
        request.user.is_admin_role
        or course.trainer_id == request.user.id
        or course.students.filter(pk=request.user.pk).exists()
    )
    if not allowed:
        raise PermissionDenied
    return render(request, 'core/course_detail.html', {'course': course})


@login_required
def course_form(request, pk=None):
    require_manager(request.user)
    instance = get_object_or_404(Course, pk=pk) if pk else None
    if request.user.is_trainer_role and instance and instance.trainer_id != request.user.id:
        raise PermissionDenied
    form = CourseForm(request.POST or None, instance=instance)
    if request.method == 'POST' and form.is_valid():
        course = form.save(commit=False)
        if request.user.is_trainer_role:
            course.trainer = request.user
        course.save()
        form.save_m2m()
        messages.success(request, f'{course.title} was saved.')
        return redirect('course_detail', pk=course.pk)
    return render(request, 'core/form.html', {'form': form, 'title': 'Edit course' if instance else 'Create course'})


@login_required
def lesson_form(request, pk=None):
    require_manager(request.user)
    instance = get_object_or_404(Lesson, pk=pk) if pk else None
    if request.user.is_trainer_role and instance and instance.course.trainer_id != request.user.id:
        raise PermissionDenied
    form = LessonForm(request.POST or None, instance=instance, trainer=request.user)
    if request.method == 'POST' and form.is_valid():
        lesson = form.save(commit=False)
        if request.user.is_trainer_role and lesson.course.trainer_id != request.user.id:
            raise PermissionDenied
        lesson.save()
        messages.success(request, f'{lesson.title} was saved.')
        return redirect('course_detail', pk=lesson.course_id)
    return render(request, 'core/form.html', {'form': form, 'title': 'Edit lesson' if instance else 'Add lesson'})

# Create your views here.
