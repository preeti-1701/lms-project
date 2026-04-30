"""Server-rendered HTML pages for auth + dashboard (Bootstrap UI)."""
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from .models import User


def home_page(request):
    """Landing page."""
    return render(request, 'home.html')


def register_page(request):
    """Simple HTML register form. Creates user and logs them in."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        role = request.POST.get('role', User.Role.STUDENT)

        # Basic validation
        if not username or not password:
            messages.error(request, 'Username and password are required.')
        elif User.objects.filter(username=username).exists():
            messages.error(request, 'That username is already taken.')
        else:
            if role not in dict(User.Role.choices):
                role = User.Role.STUDENT
            user = User.objects.create_user(
                username=username, email=email, password=password, role=role,
            )
            login(request, user)
            messages.success(request, 'Welcome to the LMS!')
            return redirect('dashboard')

    return render(request, 'register.html')


def login_page(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'login.html')


def logout_view(request):
    """Log out and return to home."""
    logout(request)
    return redirect('home')


@login_required
def dashboard_page(request):
    """Role-aware dashboard.

    Admins see all their courses; students see what they're enrolled in.
    """
    # Local import to avoid a circular import at module load.
    from courses.models import Course, Enrollment

    context = {'user_obj': request.user}
    if request.user.is_superuser or request.user.is_admin_role:
        context['courses'] = Course.objects.filter(instructor=request.user).order_by('-created_at')
        context['view_mode'] = 'admin'
    else:
        context['enrollments'] = (
            Enrollment.objects.filter(student=request.user)
            .select_related('course')
            .order_by('-enrolled_at')
        )
        context['view_mode'] = 'student'
    return render(request, 'dashboard.html', context)
