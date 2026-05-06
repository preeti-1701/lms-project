from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from django.http import HttpResponseForbidden
from django.views.decorators.http import require_POST
from .models import EnrollmentRequest

from .models import User, Course, CourseVideo, CourseAssignment, SessionInfo, VideoProgress
from .forms import LoginForm, UserCreateForm, UserEditForm, CourseForm, CourseVideoForm
from .decorators import role_required
from .utils import youtube_embed_url, get_client_ip




# ---------- Auth ----------

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')


def login_view(request):
    """Single login page with three tabs (Admin / Trainer / Student)."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    selected_role = request.GET.get('role', User.ROLE_STUDENT)
    if selected_role not in dict(User.ROLE_CHOICES):
        selected_role = User.ROLE_STUDENT

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            identifier = form.cleaned_data['identifier'].strip()
            password = form.cleaned_data['password']
            chosen_role = form.cleaned_data['role']

            # Find user by email or mobile (or username as fallback)
            user_qs = User.objects.filter(
                Q(email__iexact=identifier) | Q(mobile=identifier) | Q(username__iexact=identifier)
            )
            user_obj = user_qs.first()

            if not user_obj:
                messages.error(request, "No account found with those details.")
                return render(request, 'core/login.html', {'form': form, 'selected_role': chosen_role})

            if user_obj.is_disabled:
                messages.error(request, "This account is disabled. Contact an admin.")
                return render(request, 'core/login.html', {'form': form, 'selected_role': chosen_role})

            # Role tab must match the user's actual role (superusers can use any tab)
            if not user_obj.is_superuser and user_obj.role != chosen_role:
                messages.error(request, f"This account is not a {chosen_role}. Use the correct tab.")
                return render(request, 'core/login.html', {'form': form, 'selected_role': chosen_role})

            user = authenticate(request, username=user_obj.username, password=password)
            if user is None:
                messages.error(request, "Incorrect password.")
                return render(request, 'core/login.html', {'form': form, 'selected_role': chosen_role})

            auth_login(request, user)

            # Single-active-session enforcement: store this session as the active one.
            # Any older session still pointing at the old key will be logged out by middleware.
            request.session.save()
            user.active_session_key = request.session.session_key
            user.save(update_fields=['active_session_key'])

            # Track IP/device
            SessionInfo.objects.create(
                user=user,
                session_key=request.session.session_key or '',
                ip_address=get_client_ip(request) or None,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:300],
            )

            messages.success(request, f"Welcome, {user.username}!")
            return redirect('dashboard')
    else:
        form = LoginForm(initial={'role': selected_role})

    return render(request, 'core/login.html', {
        'form': form,
        'selected_role': selected_role,
    })


def logout_view(request):
    if request.user.is_authenticated:
        SessionInfo.objects.filter(user=request.user, session_key=request.session.session_key)\
                           .update(is_active=False)
        # Clear active session key so the user can log in fresh next time
        User.objects.filter(pk=request.user.pk).update(active_session_key=None)
    auth_logout(request)
    return redirect('login')


# ---------- Dashboards ----------

@login_required
def dashboard(request):
    user = request.user
    context = {'user_role': user.role}
    if user.is_admin or user.is_superuser:
        context.update({
            'total_users': User.objects.count(),
            'total_courses': Course.objects.count(),
            'total_videos': CourseVideo.objects.count(),
            'total_students': User.objects.filter(role=User.ROLE_STUDENT).count(),
        })
    elif user.is_trainer:
        context.update({
            'my_courses': Course.objects.filter(created_by=user).count(),
            'my_videos': CourseVideo.objects.filter(course__created_by=user).count(),
        })
    else:  # student
        context.update({
            'assigned_courses': CourseAssignment.objects.filter(student=user).count(),
        })
    return render(request, 'core/dashboard.html', context)


# ---------- Courses ----------

@login_required
def course_list(request):
    """All users can see all courses"""
    courses = Course.objects.all().annotate(video_count=Count('videos')).order_by('-created_at')
    return render(request, 'core/course_list.html', {'courses': courses})


@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    user = request.user

    # Access control: students must be assigned
    if user.is_student and not user.is_superuser:
        if not CourseAssignment.objects.filter(student=user, course=course).exists():
            return HttpResponseForbidden("You are not enrolled in this course.")

    # Import here (safe)
    from .models import VideoProgress

    videos = []
    for v in course.videos.all():

        # Mark video as watched
        if user.is_student:
            VideoProgress.objects.get_or_create(
                student=user,
                video=v,
                defaults={'watched': True}
            )

        videos.append({
            'id': v.id,
            'title': v.title,
            'youtube_url': v.youtube_url,
        })

    return render(request, 'core/course_detail.html', {
        'course': course,
        'videos': videos,
    })

# ---------- Manage: Courses (admin + trainer) ----------

@role_required(User.ROLE_ADMIN, User.ROLE_TRAINER)
def manage_courses(request):
    courses = Course.objects.all().annotate(video_count=Count('videos')).order_by('-created_at')
    return render(request, 'core/manage_courses.html', {'courses': courses})


@role_required(User.ROLE_ADMIN)
def manage_course_create(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save(commit=False)
            course.created_by = request.user
            course.save()
            messages.success(request, "Course created.")
            return redirect('manage_course_detail', course_id=course.id)
    else:
        form = CourseForm()
    return render(request, 'core/manage_course_form.html', {'form': form, 'title': 'New Course'})


@role_required(User.ROLE_ADMIN, User.ROLE_TRAINER)
def manage_course_detail(request, course_id):
    """Edit course + add YouTube videos.
    Trainer: can ONLY add videos
    Admin: full control
    """
    course = get_object_or_404(Course, pk=course_id)
    user = request.user

    # Trainers can only access their own courses
    if user.is_trainer and course.created_by_id != user.id:
        return HttpResponseForbidden("Trainers can only access their own courses.")

    if request.method == 'POST':

        # Trainer restriction
        if user.is_trainer:
            if 'add_video' in request.POST:
                vform = CourseVideoForm(request.POST)
                if vform.is_valid():
                    video = vform.save(commit=False)
                    video.course = course
                    video.save()
                    messages.success(request, "Video added.")
            else:
                return HttpResponseForbidden("Trainers cannot edit course details.")

        #  Admin full access
        else:
            if 'add_video' in request.POST:
                vform = CourseVideoForm(request.POST)
                if vform.is_valid():
                    video = vform.save(commit=False)
                    video.course = course
                    video.save()
                    messages.success(request, "Video added.")
            else:
                cform = CourseForm(request.POST, instance=course)
                if cform.is_valid():
                    cform.save()
                    messages.success(request, "Course updated.")

        return redirect('manage_course_detail', course_id=course.id)

    # Forms for GET request
    cform = CourseForm(instance=course)
    vform = CourseVideoForm()

    return render(request, 'core/manage_course_detail.html', {
        'course': course,
        'cform': cform,
        'vform': vform,
    })


@role_required(User.ROLE_ADMIN)
@require_POST
def manage_video_delete(request, video_id):
    video = get_object_or_404(CourseVideo, pk=video_id)
    if request.user.is_trainer and video.course.created_by_id != request.user.id:
        return HttpResponseForbidden()
    course_id = video.course_id
    video.delete()
    messages.success(request, "Video deleted.")
    return redirect('manage_course_detail', course_id=course_id)


# ---------- Manage: Users (admin only) ----------

@role_required(User.ROLE_ADMIN)
def manage_users(request):
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'core/manage_users.html', {'users': users})


@role_required(User.ROLE_ADMIN)
def manage_user_create(request):
    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = form.cleaned_data['role']
            user.email = form.cleaned_data['email']
            user.mobile = form.cleaned_data.get('mobile') or None
            user.save()
            messages.success(request, "User created.")
            return redirect('manage_users')
    else:
        form = UserCreateForm()
    return render(request, 'core/manage_user_form.html', {'form': form, 'title': 'New User'})


@role_required(User.ROLE_ADMIN)
def manage_user_edit(request, user_id):
    target = get_object_or_404(User, pk=user_id)
    if request.method == 'POST':
        form = UserEditForm(request.POST, instance=target)
        if form.is_valid():
            form.save()
            messages.success(request, "User updated.")
            return redirect('manage_users')
    else:
        form = UserEditForm(instance=target)
    return render(request, 'core/manage_user_form.html',
                  {'form': form, 'title': f'Edit {target.username}'})


@role_required(User.ROLE_ADMIN)
def manage_user_assign(request, user_id):
    """Assign courses to a student."""
    student = get_object_or_404(User, pk=user_id, role=User.ROLE_STUDENT)
    all_courses = Course.objects.all().order_by('title')
    assigned_ids = set(CourseAssignment.objects.filter(student=student)
                                                .values_list('course_id', flat=True))
    if request.method == 'POST':
        selected = set(map(int, request.POST.getlist('courses')))
        # add new
        for cid in selected - assigned_ids:
            CourseAssignment.objects.get_or_create(student=student, course_id=cid)
        # remove unselected
        for cid in assigned_ids - selected:
            CourseAssignment.objects.filter(student=student, course_id=cid).delete()
        messages.success(request, "Course assignments updated.")
        return redirect('manage_users')
    return render(request, 'core/manage_user_assign.html', {
        'student': student,
        'all_courses': all_courses,
        'assigned_ids': assigned_ids,
    })


@role_required(User.ROLE_ADMIN)
@require_POST
def manage_user_force_logout(request, user_id):
    target = get_object_or_404(User, pk=user_id)
    target.active_session_key = None
    target.save(update_fields=['active_session_key'])
    SessionInfo.objects.filter(user=target, is_active=True).update(is_active=False)
    messages.success(request, f"{target.username} will be logged out on next request.")
    return redirect('manage_users')


# ---------- Simple JWT API (optional, for mobile/SPA clients)----------

from rest_framework_simplejwt.views import TokenObtainPairView  # noqa: E402

class APITokenView(TokenObtainPairView):
    """POST {username, password} -> {access, refresh}. SRS: token-based auth."""
    pass

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')
        trainer_code = request.POST.get('trainer_code')

        #  No admin registration
        if role == User.ROLE_ADMIN:
            messages.error(request, "Admin cannot register from here.")
            return redirect('signup')

        # Trainer code check
        if role == User.ROLE_TRAINER:
            if trainer_code != "TRAINER123":
                messages.error(request, "Invalid trainer code.")
                return redirect('signup')

        #  Email check
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already exists.")
            return redirect('signup')

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role
        )

        messages.success(request, "Account created successfully. Please login.")
        return redirect('login')

    return render(request, 'core/signup.html')

@login_required
def enroll_course(request, course_id):
    course = get_object_or_404(Course, pk=course_id)

    # Only students can enroll
    if not request.user.is_student:
        return HttpResponseForbidden("Only students can enroll.")

    # Import model 
    from .models import EnrollmentRequest

    obj, created = EnrollmentRequest.objects.get_or_create(
        student=request.user,
        course=course
    )

    if created:
        messages.success(request, "Enrollment request sent. Admin will verify.")
    else:
        messages.info(request, "You already requested this course.")

    return redirect('course_list')


@role_required(User.ROLE_ADMIN)
def manage_enrollments(request):
    from .models import EnrollmentRequest

    requests = EnrollmentRequest.objects.select_related('student', 'course').order_by('-created_at')

    return render(request, 'core/manage_enrollments.html', {
        'requests': requests
    })

@role_required(User.ROLE_ADMIN)
@require_POST
def approve_enrollment(request, req_id):
    from .models import EnrollmentRequest

    req = get_object_or_404(EnrollmentRequest, pk=req_id)

    # Assign course
    CourseAssignment.objects.get_or_create(
        student=req.student,
        course=req.course
    )

    req.status = 'approved'
    req.save()

    messages.success(request, "Enrollment approved.")
    return redirect('manage_enrollments')


@role_required(User.ROLE_ADMIN)
@require_POST
def reject_enrollment(request, req_id):
    from .models import EnrollmentRequest

    req = get_object_or_404(EnrollmentRequest, pk=req_id)

    req.status = 'rejected'
    req.save()

    messages.warning(request, "Enrollment rejected.")
    return redirect('manage_enrollments')

@role_required(User.ROLE_ADMIN)
@require_POST
def delete_course(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    course.delete()
    messages.success(request, "Course deleted.")
    return redirect('manage_courses')

@role_required(User.ROLE_TRAINER)
def trainer_progress(request):
    from .models import VideoProgress

    data = VideoProgress.objects.select_related(
        'student', 'video', 'video__course'
    ).order_by('-watched_at')

    return render(request, 'core/trainer_progress.html', {
        'data': data
    })


"""
Views for the LMS.

Pages:
  /                       -> redirect to dashboard or login
  /login/                 -> tabbed login (Admin / Trainer / Student)
  /logout/
  /dashboard/             -> role-based dashboard
  /courses/               -> list of courses (assigned ones for students)
  /courses/<id>/          -> course detail with secure YouTube player
  /manage/users/          -> admin only
  /manage/users/new/      -> admin only
  /manage/users/<id>/     -> admin only (edit/disable)
  /manage/users/<id>/assign/  -> admin only (assign courses)
  /manage/users/<id>/force-logout/ -> admin force logout
  /manage/courses/        -> admin/trainer
  /manage/courses/new/    -> admin/trainer
  /manage/courses/<id>/   -> admin/trainer (manage videos)

Plus a simple JWT API endpoint for token-based auth.
"""