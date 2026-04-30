"""Top-level URL configuration for the LMS project.

Routes:
- /admin/                   Django admin
- /api/auth/                Auth API (register, login=token, refresh, logout, me)
- /api/courses/             Courses API (CRUD + enroll)
- HTML pages:               /, /login/, /register/, /courses/, /courses/<id>/, /dashboard/
"""
from django.contrib import admin
from django.urls import include, path

from accounts import views as account_views
from courses import views as course_views

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # REST API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),

    # Server-rendered HTML pages (Bootstrap UI)
    path('', account_views.home_page, name='home'),
    path('register/', account_views.register_page, name='register-page'),
    path('login/', account_views.login_page, name='login-page'),
    path('logout/', account_views.logout_view, name='logout'),
    path('dashboard/', account_views.dashboard_page, name='dashboard'),
    path('courses/', course_views.course_list_page, name='course-list-page'),
    path('courses/<int:pk>/', course_views.course_detail_page, name='course-detail-page'),
    path('courses/new/', course_views.course_create_page, name='course-create-page'),
    path('courses/<int:pk>/edit/', course_views.course_edit_page, name='course-edit-page'),
    path('courses/<int:pk>/delete/', course_views.course_delete_page, name='course-delete-page'),
    path('lessons/<int:pk>/toggle/', course_views.lesson_toggle_complete, name='lesson-toggle'),
]
