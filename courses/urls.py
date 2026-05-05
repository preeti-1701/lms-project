from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────
    path('',         views.dashboard,    name='dashboard'),
    path('login/',   views.login_view,   name='login'),
    path('logout/',  views.logout_view,  name='logout'),
    path('profile/', views.profile,      name='profile'),

    # ── Admin ─────────────────────────────────
    path('admin-panel/',                         views.admin_dashboard,   name='admin_dashboard'),
    path('admin-panel/courses/',                 views.admin_courses,     name='admin_courses'),
    path('admin-panel/courses/add/',             views.admin_add_course,  name='admin_add_course'),
    path('admin-panel/courses/<int:pk>/edit/',   views.admin_edit_course, name='admin_edit_course'),
    path('admin-panel/courses/<int:pk>/delete/', views.admin_delete_course, name='admin_delete_course'),
    path('admin-panel/users/',                   views.admin_users,       name='admin_users'),

    # ── Student ───────────────────────────────
    path('student/',                              views.student_dashboard, name='student_dashboard'),
    path('student/courses/',                      views.student_courses,   name='student_courses'),
    path('student/courses/<int:pk>/enroll/',      views.student_enroll,    name='student_enroll'),
    path('student/courses/<int:pk>/watch/',       views.student_watch,     name='student_watch'),

    # ── Trainer ───────────────────────────────
    path('trainer/',              views.trainer_dashboard, name='trainer_dashboard'),
    path('trainer/courses/',      views.trainer_courses,   name='trainer_courses'),
    path('trainer/courses/add/',  views.trainer_add_course,name='trainer_add_course'),
]
