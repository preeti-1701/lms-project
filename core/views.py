import json
import secrets

from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session
from django.core.exceptions import PermissionDenied
from django.db import models
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .forms import CourseForm, EnrollmentForm, LMSUserCreationForm, UserUpdateForm, VideoForm
from .models import Course, Enrollment, Profile, SessionActivity, Video

User = get_user_model()


def _require_admin(user):
    if user.profile.role != Profile.Role.ADMIN:
        raise PermissionDenied("Only admins can perform this action.")


def _require_creator_or_admin(user, course):
    role = user.profile.role
    if role == Profile.Role.ADMIN:
        return
    if role == Profile.Role.TRAINER and course.created_by_id == user.id:
        return
    raise PermissionDenied("You do not have access to this course.")


@login_required
def dashboard(request):
    role = request.user.profile.role

    if role == Profile.Role.STUDENT:
        courses = request.user.enrolled_courses.prefetch_related("videos")
    elif role == Profile.Role.TRAINER:
        courses = Course.objects.filter(created_by=request.user).prefetch_related("videos")
    else:
        courses = Course.objects.all().prefetch_related("videos")

    context = {
        "role": role,
        "courses": courses,
    }
    return render(request, "core/dashboard.html", context)


@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course.objects.prefetch_related("videos"), id=course_id)
    role = request.user.profile.role

    if role == Profile.Role.STUDENT and not course.students.filter(id=request.user.id).exists():
        raise PermissionDenied("You are not assigned to this course.")

    if role == Profile.Role.TRAINER and course.created_by_id != request.user.id:
        raise PermissionDenied("You can only access courses you created.")

    return render(request, "core/course_detail.html", {"course": course})


@login_required
def video_watch(request, course_id, video_id):
    course = get_object_or_404(Course, id=course_id)
    _require_creator_or_admin(request.user, course) if request.user.profile.role != Profile.Role.STUDENT else None

    if request.user.profile.role == Profile.Role.STUDENT and not course.students.filter(id=request.user.id).exists():
        raise PermissionDenied("You are not assigned to this course.")

    video = get_object_or_404(Video, id=video_id, course=course)
    embed_url = _youtube_embed_url(video.youtube_url)
    return render(request, "core/video_watch.html", {"course": course, "video": video, "embed_url": embed_url})


@login_required
def course_create(request):
    if request.user.profile.role not in {Profile.Role.ADMIN, Profile.Role.TRAINER}:
        raise PermissionDenied("Only admin or trainer can create courses.")

    if request.method == "POST":
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save(commit=False)
            course.created_by = request.user
            course.save()
            Video.objects.create(
                course=course,
                title=course.title,
                youtube_url=form.cleaned_data["youtube_url"],
                brief_detail=course.description,
                position=1,
            )
            messages.success(request, "Course created successfully.")
            return redirect("course_detail", course_id=course.id)
    else:
        form = CourseForm()

    return render(request, "core/course_form.html", {"form": form, "title": "Create Course"})


@login_required
def video_add(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    _require_creator_or_admin(request.user, course)

    if request.method == "POST":
        form = VideoForm(request.POST)
        if form.is_valid():
            video = form.save(commit=False)
            video.course = course
            video.save()
            messages.success(request, "Video added successfully.")
            return redirect("course_detail", course_id=course.id)
    else:
        form = VideoForm()

    return render(
        request,
        "core/video_form.html",
        {"form": form, "course": course, "title": "Add Video"},
    )


@login_required
def manage_users(request):
    _require_admin(request.user)
    users = User.objects.select_related("profile").order_by("username")
    return render(request, "core/manage_users.html", {"users": users})


@login_required
def user_create(request):
    _require_admin(request.user)

    if request.method == "POST":
        form = LMSUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.email = form.cleaned_data["email"]
            user.save(update_fields=["email"])
            user.profile.role = form.cleaned_data["role"]
            user.profile.mobile = form.cleaned_data["mobile"]
            user.profile.save(update_fields=["role", "mobile"])
            messages.success(request, "User created successfully.")
            return redirect("manage_users")
    else:
        form = LMSUserCreationForm()

    return render(request, "core/user_form.html", {"form": form, "title": "Create User", "is_edit": False})


@login_required
def user_edit(request, user_id):
    _require_admin(request.user)
    target_user = get_object_or_404(User.objects.select_related("profile"), id=user_id)

    initial = {
        "role": target_user.profile.role,
        "mobile": target_user.profile.mobile,
    }

    if request.method == "POST":
        form = UserUpdateForm(request.POST, instance=target_user, initial=initial)
        if form.is_valid():
            user = form.save()
            user.profile.role = form.cleaned_data["role"]
            user.profile.mobile = form.cleaned_data["mobile"]
            user.profile.save(update_fields=["role", "mobile"])
            messages.success(request, "User updated successfully.")
            return redirect("manage_users")
    else:
        form = UserUpdateForm(instance=target_user, initial=initial)

    return render(request, "core/user_form.html", {"form": form, "title": "Edit User", "is_edit": True})


@login_required
def user_delete(request, user_id):
    _require_admin(request.user)
    target_user = get_object_or_404(User.objects.select_related("profile"), id=user_id)

    if request.method != "POST":
        return redirect("manage_users")

    if target_user.id == request.user.id:
        messages.error(request, "You cannot delete your own admin account.")
        return redirect("manage_users")

    target_username = target_user.username
    target_user.delete()
    messages.success(request, f"User '{target_username}' deleted successfully.")
    return redirect("manage_users")


@login_required
def enrollment_add(request, course_id):
    _require_admin(request.user)
    course = get_object_or_404(Course, id=course_id)

    if request.method == "POST":
        form = EnrollmentForm(request.POST)
        if form.is_valid():
            selected_students = form.cleaned_data["students"]
            assigned_count = 0
            already_assigned_count = 0

            for student in selected_students:
                _, created = Enrollment.objects.get_or_create(course=course, student=student)
                if created:
                    assigned_count += 1
                else:
                    already_assigned_count += 1

            if assigned_count:
                messages.success(request, f"{assigned_count} student(s) assigned to course.")
            if already_assigned_count:
                messages.info(request, f"{already_assigned_count} student(s) were already assigned.")
            return redirect("course_detail", course_id=course.id)
    else:
        form = EnrollmentForm()

    return render(request, "core/enrollment_form.html", {"form": form, "course": course})


@login_required
def user_sessions(request):
    _require_admin(request.user)
    users = User.objects.select_related("profile").all().order_by("username")
    activities = SessionActivity.objects.select_related("user")[:50]
    return render(
        request,
        "core/user_sessions.html",
        {
            "users": users,
            "activities": activities,
        },
    )


@login_required
def force_logout(request, user_id):
    _require_admin(request.user)
    target_user = get_object_or_404(User.objects.select_related("profile"), id=user_id)

    if request.method == "POST":
        session_key = target_user.profile.active_session_key
        if session_key:
            Session.objects.filter(session_key=session_key).delete()

        target_user.profile.active_session_key = ""
        target_user.profile.session_token = ""
        target_user.profile.save(update_fields=["active_session_key", "session_token"])

        SessionActivity.objects.filter(
            user=target_user,
            is_active=True,
        ).update(is_active=False, logged_out_at=timezone.now())

        messages.success(request, f"{target_user.username} has been logged out.")

    return redirect("user_sessions")


def _youtube_embed_url(url):
    if "watch?v=" in url:
        video_id = url.split("watch?v=")[-1].split("&")[0]
        return f"https://www.youtube.com/embed/{video_id}"
    if "youtu.be/" in url:
        video_id = url.split("youtu.be/")[-1].split("?")[0]
        return f"https://www.youtube.com/embed/{video_id}"
    return url


def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


def _api_auth_required(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    return None


def _course_payload(course):
    first_video = course.videos.order_by("position", "id").first()
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "created_by": course.created_by.username,
        "students_count": course.students.count(),
        "videos_count": course.videos.count(),
        "first_video_url": first_video.youtube_url if first_video else "",
    }


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    data = _json_body(request)
    identifier = data.get("identifier", "")
    password = data.get("password", "")
    user = authenticate(request, username=identifier, password=password)
    if not user:
        return JsonResponse({"error": "Invalid credentials."}, status=400)
    login(request, user)
    return JsonResponse({"ok": True, "user": {"username": user.username, "role": user.profile.role}})


@csrf_exempt
@require_http_methods(["POST"])
def api_forgot_password(request):
    data = _json_body(request)
    identifier = (data.get("identifier") or "").strip()
    new_password = data.get("new_password") or ""
    if not identifier or not new_password:
        return JsonResponse({"error": "Identifier and new password are required."}, status=400)

    user = (
        User.objects.select_related("profile")
        .filter(
            models.Q(username__iexact=identifier)
            | models.Q(email__iexact=identifier)
            | models.Q(profile__mobile=identifier)
        )
        .first()
    )
    if not user:
        return JsonResponse({"error": "User not found."}, status=404)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    return JsonResponse({"ok": True, "message": "Password reset successful."})


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    if request.user.is_authenticated:
        logout(request)
    return JsonResponse({"ok": True})


@require_http_methods(["GET"])
def api_me(request):
    err = _api_auth_required(request)
    if err:
        return err
    return JsonResponse(
        {
            "username": request.user.username,
            "role": request.user.profile.role,
            "email": request.user.email,
            "last_login": request.user.last_login.isoformat() if request.user.last_login else None,
        }
    )


@require_http_methods(["GET"])
def api_dashboard(request):
    err = _api_auth_required(request)
    if err:
        return err
    role = request.user.profile.role
    if role == Profile.Role.STUDENT:
        courses = request.user.enrolled_courses.prefetch_related("videos")
    elif role == Profile.Role.TRAINER:
        courses = Course.objects.filter(created_by=request.user).prefetch_related("videos")
    else:
        courses = Course.objects.all().prefetch_related("videos")
    return JsonResponse({"role": role, "courses": [_course_payload(c) for c in courses]})


@require_http_methods(["GET"])
def api_course_detail(request, course_id):
    err = _api_auth_required(request)
    if err:
        return err
    course = get_object_or_404(Course.objects.prefetch_related("videos", "students"), id=course_id)
    role = request.user.profile.role
    if role == Profile.Role.STUDENT and not course.students.filter(id=request.user.id).exists():
        return JsonResponse({"error": "Not assigned to this course."}, status=403)
    if role == Profile.Role.TRAINER and course.created_by_id != request.user.id:
        return JsonResponse({"error": "Not allowed for this course."}, status=403)
    return JsonResponse(
        {
            "course": _course_payload(course),
            "students": [{"id": s.id, "username": s.username, "email": s.email} for s in course.students.all()],
            "videos": [
                {
                    "id": v.id,
                    "title": v.title,
                    "youtube_url": v.youtube_url,
                    "brief_detail": v.brief_detail,
                    "position": v.position,
                }
                for v in course.videos.all()
            ],
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def api_course_create(request):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role not in {Profile.Role.ADMIN, Profile.Role.TRAINER}:
        return JsonResponse({"error": "Only admin/trainer can create."}, status=403)
    data = _json_body(request)
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    youtube_url = (data.get("youtube_url") or "").strip()
    if not title or not youtube_url:
        return JsonResponse({"error": "Title and YouTube link are required."}, status=400)
    course = Course.objects.create(title=title, description=description, created_by=request.user)
    Video.objects.create(course=course, title=title, youtube_url=youtube_url, brief_detail=description, position=1)
    return JsonResponse({"ok": True, "course": _course_payload(course)})


@require_http_methods(["GET"])
def api_users(request):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)
    users = User.objects.select_related("profile").all().order_by("username")
    return JsonResponse(
        {
            "users": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "mobile": u.profile.mobile,
                    "role": u.profile.role,
                    "is_active": u.is_active,
                }
                for u in users
            ]
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def api_user_create(request):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)
    data = _json_body(request)
    role = data.get("role")
    if role not in {Profile.Role.ADMIN, Profile.Role.TRAINER, Profile.Role.STUDENT}:
        return JsonResponse({"error": "Role must be admin, trainer or student."}, status=400)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return JsonResponse({"error": "Username and password are required."}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists."}, status=400)
    user = User.objects.create_user(username=username, password=password, email=(data.get("email") or "").strip())
    user.profile.role = role
    user.profile.mobile = (data.get("mobile") or "").strip()
    user.profile.save(update_fields=["role", "mobile"])
    return JsonResponse({"ok": True, "id": user.id})


@csrf_exempt
@require_http_methods(["DELETE"])
def api_user_delete(request, user_id):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)
    target = get_object_or_404(User, id=user_id)
    if target.id == request.user.id:
        return JsonResponse({"error": "Cannot delete your own account."}, status=400)
    target.delete()
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["PUT"])
def api_user_update(request, user_id):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)

    target = get_object_or_404(User.objects.select_related("profile"), id=user_id)
    if target.id == request.user.id:
        return JsonResponse({"error": "You cannot edit your own admin role here."}, status=400)

    data = _json_body(request)
    role = data.get("role", target.profile.role)
    if role not in {Profile.Role.ADMIN, Profile.Role.TRAINER, Profile.Role.STUDENT}:
        return JsonResponse({"error": "Role must be admin, trainer or student."}, status=400)

    target.username = (data.get("username") or target.username).strip()
    target.email = (data.get("email") or "").strip()
    target.is_active = bool(data.get("is_active", True))
    target.save(update_fields=["username", "email", "is_active"])

    target.profile.role = role
    target.profile.mobile = (data.get("mobile") or "").strip()
    target.profile.save(update_fields=["role", "mobile"])

    new_password = data.get("password") or ""
    if new_password:
        target.set_password(new_password)
        target.save(update_fields=["password"])

    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["POST"])
def api_enroll_students(request, course_id):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role not in {Profile.Role.ADMIN, Profile.Role.TRAINER}:
        return JsonResponse({"error": "Only admin/trainer allowed."}, status=403)
    course = get_object_or_404(Course, id=course_id)
    if request.user.profile.role == Profile.Role.TRAINER and course.created_by_id != request.user.id:
        return JsonResponse({"error": "Trainer can assign only their own courses."}, status=403)
    data = _json_body(request)
    student_ids = data.get("student_ids") or []
    assigned = 0
    for sid in student_ids:
        student = User.objects.filter(id=sid, profile__role=Profile.Role.STUDENT).first()
        if student:
            _, created = Enrollment.objects.get_or_create(course=course, student=student)
            if created:
                assigned += 1
    return JsonResponse({"ok": True, "assigned_count": assigned})


@require_http_methods(["GET"])
def api_students(request):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role not in {Profile.Role.ADMIN, Profile.Role.TRAINER}:
        return JsonResponse({"error": "Only admin/trainer allowed."}, status=403)
    students = User.objects.filter(profile__role=Profile.Role.STUDENT).order_by("username")
    return JsonResponse(
        {
            "students": [
                {"id": student.id, "username": student.username, "email": student.email}
                for student in students
            ]
        }
    )


@require_http_methods(["GET"])
def api_stats(request):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)

    data = {
        "students": User.objects.filter(profile__role=Profile.Role.STUDENT).count(),
        "trainers": User.objects.filter(profile__role=Profile.Role.TRAINER).count(),
        "admins": User.objects.filter(profile__role=Profile.Role.ADMIN).count(),
        "total_users": User.objects.count(),
        "total_courses": Course.objects.count(),
    }
    return JsonResponse(data)


@require_http_methods(["GET"])
def api_sessions(request):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)
    users = User.objects.select_related("profile").order_by("username")
    activities = SessionActivity.objects.select_related("user")[:50]
    return JsonResponse(
        {
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "role": user.profile.role,
                    "active_session": bool(user.profile.active_session_key),
                }
                for user in users
            ],
            "activities": [
                {
                    "id": activity.id,
                    "username": activity.user.username,
                    "ip_address": activity.ip_address,
                    "user_agent": activity.user_agent,
                    "logged_in_at": activity.logged_in_at.isoformat(),
                    "logged_out_at": activity.logged_out_at.isoformat() if activity.logged_out_at else None,
                    "is_active": activity.is_active,
                }
                for activity in activities
            ],
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def api_force_logout(request, user_id):
    err = _api_auth_required(request)
    if err:
        return err
    if request.user.profile.role != Profile.Role.ADMIN:
        return JsonResponse({"error": "Only admins allowed."}, status=403)
    target_user = get_object_or_404(User.objects.select_related("profile"), id=user_id)
    session_key = target_user.profile.active_session_key
    if session_key:
        Session.objects.filter(session_key=session_key).delete()
    target_user.profile.active_session_key = ""
    target_user.profile.session_token = ""
    target_user.profile.save(update_fields=["active_session_key", "session_token"])
    SessionActivity.objects.filter(user=target_user, is_active=True).update(is_active=False, logged_out_at=timezone.now())
    return JsonResponse({"ok": True})


@require_http_methods(["GET"])
def api_student_watch_link(request, course_id, video_id):
    err = _api_auth_required(request)
    if err:
        return err
    course = get_object_or_404(Course, id=course_id)
    if request.user.profile.role == Profile.Role.STUDENT and not course.students.filter(id=request.user.id).exists():
        return JsonResponse({"error": "Not assigned to this course."}, status=403)
    if request.user.profile.role == Profile.Role.TRAINER and course.created_by_id != request.user.id:
        return JsonResponse({"error": "Not allowed for this course."}, status=403)
    video = get_object_or_404(Video, id=video_id, course=course)

    token = secrets.token_urlsafe(16)
    request.session[f"watch_token:{video.id}"] = token
    request.session[f"watch_token_exp:{video.id}"] = (timezone.now() + timezone.timedelta(minutes=5)).isoformat()

    return JsonResponse({"watch_url": f"/watch/{course.id}/{video.id}/?token={token}"})


@login_required
def watch_redirect(request, course_id, video_id):
    course = get_object_or_404(Course, id=course_id)
    role = request.user.profile.role

    if role == Profile.Role.STUDENT and not course.students.filter(id=request.user.id).exists():
        raise PermissionDenied("You are not assigned to this course.")
    if role == Profile.Role.TRAINER and course.created_by_id != request.user.id:
        raise PermissionDenied("Not allowed for this course.")

    video = get_object_or_404(Video, id=video_id, course=course)
    token = request.GET.get("token", "")
    expected = request.session.get(f"watch_token:{video.id}", "")
    exp_raw = request.session.get(f"watch_token_exp:{video.id}", "")

    if not token or token != expected or not exp_raw:
        raise PermissionDenied("Invalid or expired link.")

    try:
        exp = timezone.datetime.fromisoformat(exp_raw)
        if timezone.is_naive(exp):
            exp = timezone.make_aware(exp, timezone.get_current_timezone())
    except ValueError:
        raise PermissionDenied("Invalid link.")

    if timezone.now() > exp:
        raise PermissionDenied("Expired link.")

    return HttpResponseRedirect(video.youtube_url)
