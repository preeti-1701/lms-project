from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Count, Q
from django.utils import timezone
from django.views.decorators.http import require_POST

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    User, Course, Lesson, Enrollment, LessonProgress,
    Quiz, Question, QuizAttempt
)
from .forms import SignUpForm, CourseForm, LessonForm, QuizForm, QuestionForm
from .serializers import (
    UserSerializer, CourseSerializer, CourseDetailSerializer,
    LessonSerializer, EnrollmentSerializer, QuizSerializer,
    QuestionSerializer, QuizAttemptSerializer
)


# =============== HTML VIEWS ===============

def landing(request):
    """Public landing page."""
    if request.user.is_authenticated:
        return redirect('dashboard')
    stats = {
        'courses': Course.objects.filter(is_published=True).count(),
        'students': User.objects.filter(role='student').count(),
        'instructors': User.objects.filter(role='instructor').count(),
        'lessons': Lesson.objects.count(),
    }
    featured_courses = Course.objects.filter(is_published=True)[:6]
    return render(request, 'landing.html', {'stats': stats, 'featured_courses': featured_courses})


def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome aboard, {user.first_name}!")
            return redirect('dashboard')
    else:
        form = SignUpForm()
    return render(request, 'auth/signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, "Invalid username or password")
    return render(request, 'auth/login.html')


def logout_view(request):
    logout(request)
    return redirect('landing')


@login_required
def dashboard(request):
    """Role-aware dashboard."""
    user = request.user
    context = {'user': user}

    if user.is_student:
        enrollments = Enrollment.objects.filter(student=user).select_related('course', 'course__instructor')
        in_progress = [e for e in enrollments if not e.completed]
        completed = [e for e in enrollments if e.completed]
        context.update({
            'enrollments': enrollments,
            'in_progress': in_progress[:3],
            'completed_count': len(completed),
            'total_enrollments': len(enrollments),
            'avg_progress': int(sum(e.progress_percent for e in enrollments) / len(enrollments)) if enrollments else 0,
            'recent_quiz_attempts': QuizAttempt.objects.filter(student=user).select_related('quiz', 'quiz__course')[:5],
        })
    else:  # instructor
        courses = Course.objects.filter(instructor=user).annotate(
            total_students=Count('enrollments', distinct=True),
            total_lessons=Count('lessons', distinct=True),
        )
        total_students = Enrollment.objects.filter(course__instructor=user).count()
        context.update({
            'courses': courses,
            'total_courses': courses.count(),
            'total_students': total_students,
            'total_lessons': sum(c.total_lessons for c in courses),
        })

    return render(request, 'dashboard.html', context)


def course_catalog(request):
    """Browse all published courses."""
    query = request.GET.get('q', '')
    level = request.GET.get('level', '')
    category = request.GET.get('category', '')

    courses = Course.objects.filter(is_published=True).select_related('instructor').annotate(
        lesson_total=Count('lessons', distinct=True),
        student_total=Count('enrollments', distinct=True),
    )

    if query:
        courses = courses.filter(Q(title__icontains=query) | Q(description__icontains=query))
    if level:
        courses = courses.filter(level=level)
    if category:
        courses = courses.filter(category__iexact=category)

    categories = Course.objects.values_list('category', flat=True).distinct()

    return render(request, 'catalog.html', {
        'courses': courses,
        'query': query,
        'selected_level': level,
        'selected_category': category,
        'categories': categories,
    })


def course_detail(request, slug):
    course = get_object_or_404(Course, slug=slug)
    lessons = course.lessons.all()
    quizzes = course.quizzes.all()

    is_enrolled = False
    enrollment = None
    if request.user.is_authenticated and request.user.is_student:
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        is_enrolled = enrollment is not None

    return render(request, 'course_detail.html', {
        'course': course,
        'lessons': lessons,
        'quizzes': quizzes,
        'is_enrolled': is_enrolled,
        'enrollment': enrollment,
    })


@login_required
@require_POST
def enroll_course(request, slug):
    course = get_object_or_404(Course, slug=slug)
    if not request.user.is_student:
        messages.error(request, "Only students can enroll in courses")
        return redirect('course_detail', slug=slug)

    enrollment, created = Enrollment.objects.get_or_create(
        student=request.user, course=course
    )
    if created:
        messages.success(request, f"You're now enrolled in {course.title}!")
    else:
        messages.info(request, "You're already enrolled in this course")
    return redirect('course_detail', slug=slug)


@login_required
def lesson_view(request, course_slug, lesson_id):
    course = get_object_or_404(Course, slug=course_slug)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

    enrollment = None
    progress = None
    if request.user.is_student:
        enrollment = get_object_or_404(Enrollment, student=request.user, course=course)
        progress, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)

    all_lessons = course.lessons.all()
    lesson_list = list(all_lessons)
    idx = lesson_list.index(lesson) if lesson in lesson_list else 0
    prev_lesson = lesson_list[idx - 1] if idx > 0 else None
    next_lesson = lesson_list[idx + 1] if idx < len(lesson_list) - 1 else None

    return render(request, 'lesson.html', {
        'course': course,
        'lesson': lesson,
        'all_lessons': all_lessons,
        'progress': progress,
        'enrollment': enrollment,
        'prev_lesson': prev_lesson,
        'next_lesson': next_lesson,
    })


@login_required
@require_POST
def mark_lesson_complete(request, course_slug, lesson_id):
    course = get_object_or_404(Course, slug=course_slug)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)
    enrollment = get_object_or_404(Enrollment, student=request.user, course=course)
    progress, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
    progress.is_completed = True
    progress.completed_at = timezone.now()
    progress.save()
    enrollment.check_completion()
    return JsonResponse({
        'success': True,
        'progress_percent': enrollment.progress_percent,
        'completed': enrollment.completed,
    })


# Instructor course management
@login_required
def create_course(request):
    if not request.user.is_instructor:
        messages.error(request, "Only instructors can create courses")
        return redirect('dashboard')

    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save(commit=False)
            course.instructor = request.user
            course.save()
            messages.success(request, f'Course "{course.title}" created successfully!')
            return redirect('manage_course', slug=course.slug)
    else:
        form = CourseForm()
    return render(request, 'instructor/course_form.html', {'form': form, 'action': 'Create'})


@login_required
def manage_course(request, slug):
    course = get_object_or_404(Course, slug=slug, instructor=request.user)
    lessons = course.lessons.all()
    quizzes = course.quizzes.all()
    enrollments = course.enrollments.select_related('student').all()
    return render(request, 'instructor/manage_course.html', {
        'course': course,
        'lessons': lessons,
        'quizzes': quizzes,
        'enrollments': enrollments,
    })


@login_required
def add_lesson(request, slug):
    course = get_object_or_404(Course, slug=slug, instructor=request.user)
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.course = course
            if not lesson.order:
                lesson.order = (course.lessons.count() + 1)
            lesson.save()
            messages.success(request, f'Lesson "{lesson.title}" added!')
            return redirect('manage_course', slug=slug)
    else:
        form = LessonForm(initial={'order': course.lessons.count() + 1})
    return render(request, 'instructor/lesson_form.html', {'form': form, 'course': course})


@login_required
def add_quiz(request, slug):
    course = get_object_or_404(Course, slug=slug, instructor=request.user)
    if request.method == 'POST':
        form = QuizForm(request.POST)
        if form.is_valid():
            quiz = form.save(commit=False)
            quiz.course = course
            quiz.save()
            messages.success(request, f'Quiz "{quiz.title}" created! Add questions now.')
            return redirect('manage_quiz', quiz_id=quiz.id)
    else:
        form = QuizForm()
    return render(request, 'instructor/quiz_form.html', {'form': form, 'course': course})


@login_required
def manage_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id, course__instructor=request.user)
    if request.method == 'POST':
        form = QuestionForm(request.POST)
        if form.is_valid():
            question = form.save(commit=False)
            question.quiz = quiz
            if not question.order:
                question.order = quiz.questions.count() + 1
            question.save()
            messages.success(request, 'Question added!')
            return redirect('manage_quiz', quiz_id=quiz.id)
    else:
        form = QuestionForm(initial={'order': quiz.questions.count() + 1})
    return render(request, 'instructor/manage_quiz.html', {
        'quiz': quiz,
        'form': form,
    })


@login_required
def take_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    questions = quiz.questions.all()

    if request.method == 'POST':
        correct = 0
        total = questions.count()
        for q in questions:
            answer = request.POST.get(f'question_{q.id}')
            if answer == q.correct_answer:
                correct += 1
        score = int((correct / total) * 100) if total > 0 else 0
        passed = score >= quiz.pass_score
        attempt = QuizAttempt.objects.create(
            student=request.user, quiz=quiz, score=score, passed=passed
        )
        return render(request, 'quiz_result.html', {
            'quiz': quiz,
            'attempt': attempt,
            'correct': correct,
            'total': total,
        })

    return render(request, 'take_quiz.html', {'quiz': quiz, 'questions': questions})


# =============== REST API VIEWSETS ===============

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_instructor


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_published=True).select_related('instructor')
    permission_classes = [IsInstructorOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        if not request.user.is_student:
            return Response({'error': 'Only students can enroll'}, status=400)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user, course=course
        )
        return Response({
            'enrolled': True,
            'newly_created': created,
            'course': course.title,
        })


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsInstructorOrReadOnly]


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related('course')


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsInstructorOrReadOnly]


# =============== EXTRA API ENDPOINTS FOR REACT FRONTEND ===============
from rest_framework.decorators import api_view, permission_classes as perm_classes
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import random
from .models import EmailOTP


def generate_otp():
    return f"{random.randint(100000, 999999)}"


def send_otp_email(user, code):
    """Send the OTP code to the user's email."""
    subject = 'Your Coursify verification code'
    body = f"""Hi {user.first_name or user.username},

Welcome to Coursify LMS!

Your verification code is:

    {code}

This code expires in {settings.OTP_EXPIRY_MINUTES} minutes.

If you didn't request this code, you can safely ignore this email.

— The Coursify team
"""
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@api_view(['POST'])
@perm_classes([permissions.AllowAny])
def api_signup(request):
    """Register a new student. Creates inactive user + sends OTP to email."""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    if not email or not password or not first_name:
        return Response({'error': 'Email, password, and first name are required'}, status=400)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'An account with this email already exists'}, status=400)

    # Use email as username to keep things simple; guarantee uniqueness
    username = email
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': 'Account already exists'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='student',
        is_verified=False,
    )

    # Generate OTP and send email
    code = generate_otp()
    EmailOTP.objects.create(
        user=user,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
    )
    try:
        send_otp_email(user, code)
    except Exception as e:
        # Don't delete the user — they can resend
        return Response({
            'error': f'Account created but email could not be sent: {str(e)}',
            'email': email,
        }, status=500)

    return Response({
        'success': True,
        'message': 'Verification code sent. Check your email.',
        'email': email,
    })


@api_view(['POST'])
@perm_classes([permissions.AllowAny])
def api_verify_otp(request):
    """Verify the OTP and activate the account. Returns a login token on success."""
    email = request.data.get('email', '').strip().lower()
    code = request.data.get('code', '').strip()

    if not email or not code:
        return Response({'error': 'Email and code are required'}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({'error': 'No account found with this email'}, status=404)

    if user.is_verified:
        return Response({'error': 'This account is already verified'}, status=400)

    otp = EmailOTP.objects.filter(user=user, is_used=False).order_by('-created_at').first()
    if not otp:
        return Response({'error': 'No pending verification for this account'}, status=400)

    otp.attempts += 1
    otp.save()

    if not otp.is_valid():
        return Response({'error': 'This code has expired or exceeded attempt limit. Request a new one.'}, status=400)

    if otp.code != code:
        return Response({'error': f'Incorrect code. {5 - otp.attempts} attempt(s) remaining.'}, status=400)

    # Success — verify the account
    otp.is_used = True
    otp.save()
    user.is_verified = True
    user.save()

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'success': True,
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'avatar_color': user.avatar_color,
            'initials': user.initials,
        }
    })


@api_view(['POST'])
@perm_classes([permissions.AllowAny])
def api_resend_otp(request):
    """Resend a new OTP to the user's email."""
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'error': 'Email is required'}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({'error': 'No account found with this email'}, status=404)

    if user.is_verified:
        return Response({'error': 'This account is already verified'}, status=400)

    # Invalidate old OTPs
    EmailOTP.objects.filter(user=user, is_used=False).update(is_used=True)

    code = generate_otp()
    EmailOTP.objects.create(
        user=user,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
    )
    try:
        send_otp_email(user, code)
    except Exception as e:
        return Response({'error': f'Could not send email: {str(e)}'}, status=500)

    return Response({'success': True, 'message': 'New code sent.'})


@api_view(['POST'])
@perm_classes([permissions.AllowAny])
def api_login(request):
    """Token-based login for React frontend. Accepts email or username."""
    # React will send 'email', but we also accept 'username' for compatibility
    identifier = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')
    if not identifier or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    user = authenticate(username=identifier, password=password)
    if user is None:
        return Response({'error': 'Invalid email or password'}, status=401)
    # Block unverified students (instructors skip verification)
    if user.is_student and not user.is_verified:
        return Response({
            'error': 'Please verify your email first',
            'needs_verification': True,
            'email': user.email,
        }, status=403)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'avatar_color': user.avatar_color,
            'initials': user.initials,
        }
    })


@api_view(['GET'])
@perm_classes([permissions.IsAuthenticated])
def api_me(request):
    """Get current logged-in user details."""
    user = request.user
    enrollments = Enrollment.objects.filter(student=user).select_related('course', 'course__instructor')
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'avatar_color': user.avatar_color,
        'initials': user.initials,
        'enrollments': [
            {
                'id': e.id,
                'progress_percent': e.progress_percent,
                'completed': e.completed,
                'course': {
                    'id': e.course.id,
                    'slug': e.course.slug,
                    'title': e.course.title,
                    'thumbnail_emoji': e.course.thumbnail_emoji,
                    'accent_color': e.course.accent_color,
                    'instructor_name': f"{e.course.instructor.first_name} {e.course.instructor.last_name}",
                    'level': e.course.level,
                    'category': e.course.category,
                }
            }
            for e in enrollments
        ]
    })


@api_view(['POST'])
@perm_classes([permissions.IsAuthenticated])
def api_submit_quiz(request, quiz_id):
    """Submit quiz answers from React. Body: { answers: { question_id: 'A'|'B'|'C'|'D' } }"""
    quiz = get_object_or_404(Quiz, id=quiz_id)
    answers = request.data.get('answers', {})
    questions = quiz.questions.all()
    correct = 0
    total = questions.count()
    details = []
    for q in questions:
        user_answer = answers.get(str(q.id))
        is_correct = user_answer == q.correct_answer
        if is_correct:
            correct += 1
        details.append({
            'question_id': q.id,
            'question_text': q.text,
            'user_answer': user_answer,
            'correct_answer': q.correct_answer,
            'is_correct': is_correct,
        })
    score = int((correct / total) * 100) if total > 0 else 0
    passed = score >= quiz.pass_score
    attempt = QuizAttempt.objects.create(
        student=request.user, quiz=quiz, score=score, passed=passed
    )
    return Response({
        'attempt_id': attempt.id,
        'score': score,
        'passed': passed,
        'correct': correct,
        'total': total,
        'pass_score': quiz.pass_score,
        'details': details,
    })


@api_view(['POST'])
@perm_classes([permissions.IsAuthenticated])
def api_mark_lesson_complete(request, lesson_id):
    """Mark a lesson complete from React."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    enrollment = get_object_or_404(Enrollment, student=request.user, course=lesson.course)
    progress, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
    progress.is_completed = True
    progress.completed_at = timezone.now()
    progress.save()
    enrollment.check_completion()
    return Response({
        'success': True,
        'progress_percent': enrollment.progress_percent,
        'completed': enrollment.completed,
    })
