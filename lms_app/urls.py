# ============================================
# LMS APP URL CONFIGURATION
# FILE: lms_app/urls.py
# ============================================

from django.urls import path
from . import views


urlpatterns = [

    # ========================================
    # AUTHENTICATION
    # ========================================

    path(
        '',
        views.user_login,
        name='login'
    ),

    path(
        'login/',
        views.user_login,
        name='login'
    ),

    path(
        'signup/',
        views.signup,
        name='signup'
    ),

    path(
        'logout/',
        views.user_logout,
        name='logout'
    ),


    # ========================================
    # STUDENT PANEL
    # ========================================

    path(
        'student/dashboard/',
        views.dashboard,
        name='dashboard'
    ),

    path(
        'my-courses/',
        views.my_courses,
        name='my_courses'
    ),

    path(
        'profile/',
        views.profile,
        name='profile'
    ),

    path(
        'courses/enroll/<int:id>/',
        views.enroll,
        name='enroll'
    ),

    path(
        'courses/<int:id>/video/',
        views.open_video,
        name='open_video'
    ),

    path(
        'courses/<int:id>/progress/',
        views.update_progress,
        name='update_progress'
    ),

    path(
        'certificate/<int:id>/',
        views.certificate,
        name='certificate'
    ),


    # ========================================
    # LMS ADMIN PANEL
    # ========================================

    path(
        'lms-admin/dashboard/',
        views.admin_dashboard,
        name='admin_dashboard'
    ),

    path(
        'lms-admin/students/',
        views.admin_students,
        name='admin_students'
    ),

    path(
        'lms-admin/trainers/',
        views.admin_trainers,
        name='admin_trainers'
    ),

    path(
        'lms-admin/analytics/',
        views.admin_analytics,
        name='admin_analytics'
    ),

    path(
        'courses/add/',
        views.add_course,
        name='add_course'
    ),

    path(
        'courses/delete/<int:id>/',
        views.delete_course,
        name='delete_course'
    ),


    # ========================================
    # TRAINER PANEL
    # ========================================

    path(
        'trainer/dashboard/',
        views.trainer_dashboard,
        name='trainer_dashboard'
    ),

    path(
        'trainer/students/',
        views.trainer_students,
        name='trainer_students'
    ),

    path(
        'trainer/lessons/',
        views.trainer_lessons,
        name='trainer_lessons'
    ),


    # ========================================
    # COURSE LESSONS
    # ========================================

    path(
        'courses/add-lesson/<int:id>/',
        views.add_lesson,
        name='add_lesson'
    ),


    # ========================================
    # SECURITY
    # ========================================

    path(
        'security-alert/',
        views.security_alert,
        name='security_alert'
    ),

]