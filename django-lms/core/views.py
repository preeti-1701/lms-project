from django.contrib import messages
from django.contrib.auth import get_user_model, login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import CourseForm, CourseVideoForm, SignupForm
from .models import Course, CourseAssignment, CourseVideo, Role
from .permissions import has_role, is_admin, is_staff_role, role_required, user_roles
from .utils import youtube_embed_url

User = get_user_model()


def index(request):
    return render(request, "core/index.html")


def signup(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Welcome to LearnHub!")
            return redirect("dashboard")
    else:
        form = SignupForm()
    return render(request, "registration/signup.html", {"form": form})


@login_required
def dashboard(request):
    roles = user_roles(request.user)
    assigned = Course.objects.filter(assignments__student=request.user).distinct()
    ctx = {
        "roles": sorted(roles),
        "assigned_count": assigned.count(),
        "course_count": Course.objects.count() if is_staff_role(request.user) else None,
        "user_count": User.objects.count() if is_admin(request.user) else None,
    }
    return render(request, "core/dashboard.html", ctx)


@login_required
def my_courses(request):
    if is_staff_role(request.user):
        courses = Course.objects.all()
    else:
        courses = Course.objects.filter(assignments__student=request.user).distinct()
    return render(request, "core/my_courses.html", {"courses": courses})


@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    allowed = is_staff_role(request.user) or CourseAssignment.objects.filter(course=course, student=request.user).exists()
    if not allowed:
        messages.error(request, "You are not assigned to this course.")
        return redirect("my_courses")

    videos = list(course.videos.all())
    selected_id = request.GET.get("v")
    selected = None
    if selected_id:
        try:
            selected = next((v for v in videos if str(v.id) == selected_id), None)
        except Exception:
            selected = None
    if selected is None and videos:
        selected = videos[0]

    embed = youtube_embed_url(selected.youtube_url) if selected else None
    watermark = request.user.email or request.user.get_username()

    return render(request, "core/course_detail.html", {
        "course": course,
        "videos": videos,
        "selected": selected,
        "embed_url": embed,
        "watermark": watermark,
    })


# --- Management: courses ---------------------------------------------------

@role_required(Role.ADMIN, Role.TRAINER)
def manage_courses(request):
    courses = Course.objects.all().prefetch_related("videos", "assignments__student")
    return render(request, "core/manage_courses.html", {"courses": courses})


@role_required(Role.ADMIN, Role.TRAINER)
def course_create(request):
    if request.method == "POST":
        form = CourseForm(request.POST)
        if form.is_valid():
            c = form.save(commit=False)
            c.created_by = request.user
            c.save()
            messages.success(request, "Course created.")
            return redirect("course_edit", course_id=c.id)
    else:
        form = CourseForm()
    return render(request, "core/course_form.html", {"form": form, "title": "New course"})


@role_required(Role.ADMIN, Role.TRAINER)
def course_edit(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    if request.method == "POST":
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, "Course updated.")
            return redirect("manage_courses")
    else:
        form = CourseForm(instance=course)
    video_form = CourseVideoForm()
    students = User.objects.filter(roles__role=Role.STUDENT).distinct().order_by("email")
    assignments = course.assignments.select_related("student").all()
    return render(request, "core/course_form.html", {
        "form": form,
        "course": course,
        "video_form": video_form,
        "students": students,
        "assignments": assignments,
        "title": f"Edit course",
    })


@role_required(Role.ADMIN, Role.TRAINER)
@require_POST
def course_delete(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    course.delete()
    messages.success(request, "Course deleted.")
    return redirect("manage_courses")


@role_required(Role.ADMIN, Role.TRAINER)
@require_POST
def video_add(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    form = CourseVideoForm(request.POST)
    if not form.is_valid():
        messages.error(request, "Invalid video data.")
        return redirect("course_edit", course_id=course.id)
    video = form.save(commit=False)
    video.course = course
    video.save()
    messages.success(request, "Video added.")
    return redirect("course_edit", course_id=course.id)


@role_required(Role.ADMIN, Role.TRAINER)
@require_POST
def video_delete(request, video_id):
    video = get_object_or_404(CourseVideo, pk=video_id)
    cid = video.course_id
    video.delete()
    messages.success(request, "Video removed.")
    return redirect("course_edit", course_id=cid)


@role_required(Role.ADMIN, Role.TRAINER)
@require_POST
def course_assign(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    student_id = request.POST.get("student_id")
    if not student_id:
        return HttpResponseBadRequest("student_id required")
    student = get_object_or_404(User, pk=student_id)
    if not has_role(student, Role.STUDENT):
        messages.error(request, "Selected user is not a student.")
        return redirect("course_edit", course_id=course.id)
    CourseAssignment.objects.get_or_create(course=course, student=student)
    messages.success(request, f"Assigned {student.email or student.username}.")
    return redirect("course_edit", course_id=course.id)


@role_required(Role.ADMIN, Role.TRAINER)
@require_POST
def assignment_remove(request, assignment_id):
    a = get_object_or_404(CourseAssignment, pk=assignment_id)
    cid = a.course_id
    a.delete()
    messages.success(request, "Assignment removed.")
    return redirect("course_edit", course_id=cid)


# --- Management: users (admin only) ---------------------------------------

@role_required(Role.ADMIN)
def manage_users(request):
    users = User.objects.all().select_related("profile").prefetch_related("roles").order_by("email")
    return render(request, "core/manage_users.html", {
        "users": users,
        "all_roles": [r for r, _ in Role.CHOICES],
    })


@role_required(Role.ADMIN)
@require_POST
def toggle_role(request, user_id):
    target = get_object_or_404(User, pk=user_id)
    role = request.POST.get("role")
    if role not in dict(Role.CHOICES):
        return HttpResponseBadRequest("invalid role")
    existing = Role.objects.filter(user=target, role=role).first()
    if existing:
        existing.delete()
        messages.success(request, f"Removed {role} from {target.email or target.username}.")
    else:
        Role.objects.create(user=target, role=role)
        messages.success(request, f"Granted {role} to {target.email or target.username}.")
    return redirect("manage_users")


@role_required(Role.ADMIN)
@require_POST
def toggle_disabled(request, user_id):
    target = get_object_or_404(User, pk=user_id)
    target.profile.disabled = not target.profile.disabled
    target.profile.save(update_fields=["disabled"])
    target.is_active = not target.profile.disabled
    target.save(update_fields=["is_active"])
    messages.success(request, "User status updated.")
    return redirect("manage_users")
