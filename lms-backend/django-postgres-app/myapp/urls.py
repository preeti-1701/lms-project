from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path("api/auth/register/student/", views.register_student, name="register_student"),
    path("api/auth/register/trainer/", views.register_trainer, name="register_trainer"),
    path("api/auth/login/",            views.login_view,       name="login"),
    path("api/auth/logout/",           views.logout_view,      name="logout"),
    path("api/auth/me/",               views.me,               name="me"),

    # ── Courses ───────────────────────────────────────────────────────────────
    path("api/courses/",               views.CourseListCreateView.as_view(), name="course_list"),
    path("api/courses/<int:pk>/",      views.CourseDetailView.as_view(),     name="course_detail"),
    path("api/courses/<int:course_id>/videos/", views.add_video,            name="add_video"),
    path("api/videos/<int:video_id>/",           views.delete_video,        name="delete_video"),

    # ── Enrollments ───────────────────────────────────────────────────────────
    path("api/enrollments/",              views.enrollments, name="enrollments"),
    path("api/enrollments/<int:course_id>/unenroll/", views.unenroll, name="unenroll"),

    # ── Progress ──────────────────────────────────────────────────────────────
    path("api/progress/<int:course_id>/", views.course_progress, name="course_progress"),
    path("api/progress/mark-watched/",    views.mark_watched,    name="mark_watched"),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path("api/admin/users/",                          views.all_users,          name="all_users"),
    path("api/admin/users/create/",                   views.create_user,        name="create_user"),
    path("api/admin/users/<int:user_id>/toggle/",     views.toggle_user_status, name="toggle_user_status"),
    path("api/admin/users/<int:user_id>/assign/",     views.assign_courses,     name="assign_courses"),
    path("api/admin/audit/",                          views.audit_log,          name="audit_log"),
]