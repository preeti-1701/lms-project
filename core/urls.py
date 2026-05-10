from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'lessons', views.LessonViewSet)
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')
router.register(r'quizzes', views.QuizViewSet)

urlpatterns = [
    # Landing & auth
    path('', views.landing, name='landing'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),

    # Courses (public)
    path('courses/', views.course_catalog, name='catalog'),
    path('courses/<slug:slug>/', views.course_detail, name='course_detail'),
    path('courses/<slug:slug>/enroll/', views.enroll_course, name='enroll_course'),

    # Lessons
    path('courses/<slug:course_slug>/lessons/<int:lesson_id>/', views.lesson_view, name='lesson'),
    path('courses/<slug:course_slug>/lessons/<int:lesson_id>/complete/',
         views.mark_lesson_complete, name='mark_complete'),

    # Instructor
    path('instructor/course/new/', views.create_course, name='create_course'),
    path('instructor/course/<slug:slug>/', views.manage_course, name='manage_course'),
    path('instructor/course/<slug:slug>/lesson/new/', views.add_lesson, name='add_lesson'),
    path('instructor/course/<slug:slug>/quiz/new/', views.add_quiz, name='add_quiz'),
    path('instructor/quiz/<int:quiz_id>/', views.manage_quiz, name='manage_quiz'),

    # Quiz taking
    path('quiz/<int:quiz_id>/take/', views.take_quiz, name='take_quiz'),

    # REST API
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),

    # Extra API endpoints for React frontend
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/signup/', views.api_signup, name='api_signup'),
    path('api/verify-otp/', views.api_verify_otp, name='api_verify_otp'),
    path('api/resend-otp/', views.api_resend_otp, name='api_resend_otp'),
    path('api/me/', views.api_me, name='api_me'),
    path('api/my-sessions/', views.api_my_sessions, name='api_my_sessions'),
    path('api/quiz/<int:quiz_id>/submit/', views.api_submit_quiz, name='api_submit_quiz'),
    path('api/lesson/<int:lesson_id>/complete/', views.api_mark_lesson_complete, name='api_mark_lesson_complete'),
    path('api/certificate/<slug:course_slug>/', views.api_certificate, name='api_certificate'),
    # Instructor endpoints (SRS 2.2 - Trainer role)
    path('api/instructor/stats/', views.api_instructor_stats, name='api_instructor_stats'),
    path('api/instructor/courses/', views.api_instructor_courses, name='api_instructor_courses'),
    path('api/instructor/courses/create/', views.api_instructor_create_course, name='api_instructor_create_course'),
    path('api/instructor/courses/<slug:slug>/', views.api_instructor_course_detail, name='api_instructor_course_detail'),
    path('api/instructor/courses/<slug:slug>/lessons/', views.api_instructor_create_lesson, name='api_instructor_create_lesson'),
    path('api/instructor/courses/<slug:slug>/quizzes/', views.api_instructor_create_quiz, name='api_instructor_create_quiz'),
    path('api/instructor/lessons/<int:lesson_id>/', views.api_instructor_lesson_detail, name='api_instructor_lesson_detail'),
    path('api/instructor/quizzes/<int:quiz_id>/', views.api_instructor_quiz_detail, name='api_instructor_quiz_detail'),
]
