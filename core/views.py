from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from .models import Enrollment, Course, Video

User = get_user_model()


# ------------------ HOME PAGE ------------------
def home(request):
    from core.models import Category
    
    query = request.GET.get('q')
    category_id = request.GET.get('category')
    
    courses = Course.objects.all()
    if query:
        courses = courses.filter(title__icontains=query)
    if category_id:
        courses = courses.filter(category_id=category_id)
        
    categories = Category.objects.all()
    featured_courses = Course.objects.filter(featured=True)[:3]
    
    return render(request, 'home.html', {
        'courses': courses,
        'categories': categories,
        'featured_courses': featured_courses,
        'query': query,
        'selected_category': category_id,
    })


# ------------------ SIGNUP ------------------
def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        mobile = request.POST.get('mobile')
        password = request.POST.get('password')
        role = request.POST.get('role')

        if User.objects.filter(username=username).exists():
            return render(request, 'signup.html', {
                'error': 'Username already exists'
            })

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            mobile=mobile
        )

        return redirect('/login/')

    return render(request, 'signup.html')


# ------------------ LOGIN ------------------
def login_view(request):
    next_url = request.GET.get('next')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        next_url_post = request.POST.get('next')

        from django.contrib.auth import authenticate, login
        from django.contrib.auth import get_user_model
        from core.models import UserSession

        User = get_user_model()

        # Allow login using email or username
        user_obj = User.objects.filter(email=username).first()
        if user_obj:
            username = user_obj.username

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # Track IP and Device Info
            user.last_ip = request.META.get('REMOTE_ADDR')
            user.device_info = request.META.get('HTTP_USER_AGENT')
            user.save()

            # Enforce single session
            if not request.session.session_key:
                request.session.create()
            session_key = request.session.session_key

            UserSession.objects.update_or_create(
                user=user,
                defaults={'session_key': session_key}
            )

            if next_url_post:
                return redirect(next_url_post)

            if user.role == 'admin':
                return redirect('/admin-panel/')
            elif user.role == 'trainer':
                return redirect('/trainer/')
            else:
                return redirect('/dashboard/')
        else:
            return render(request, 'login.html', {
                'error': 'Invalid username or password',
                'next': next_url_post or next_url
            })

    return render(request, 'login.html', {'next': next_url})


# ------------------ LOGOUT ------------------
def logout_view(request):
    logout(request)
    return redirect('/login/')


# ------------------ STUDENT DASHBOARD ------------------
@login_required
def dashboard(request):
    enrollments = Enrollment.objects.filter(student=request.user)

    return render(request, 'dashboard.html', {
        'enrollments': enrollments
    })


# ------------------ TRAINER DASHBOARD ------------------
@login_required
def trainer_dashboard(request):
    if request.user.role != 'trainer':
        return redirect('/dashboard/')

    from django.db.models import Avg, Count
    courses = Course.objects.filter(trainer=request.user)
    
    total_students = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()
    
    avg_completion = Enrollment.objects.filter(course__in=courses).aggregate(Avg('progress'))['progress__avg'] or 0
    avg_completion = int(avg_completion)
    
    top_course = courses.annotate(num_students=Count('enrollment')).order_by('-num_students').first()

    return render(request, 'trainer_dashboard.html', {
        'courses': courses,
        'total_students': total_students,
        'avg_completion': avg_completion,
        'top_course': top_course
    })


# ------------------ ADMIN PANEL ------------------
@login_required
def admin_panel(request):
    if request.user.role != 'admin':
        return redirect('/dashboard/')

    from django.utils import timezone
    from core.models import UserSession
    from datetime import timedelta

    role_filter = request.GET.get('role')
    if role_filter:
        users = User.objects.filter(role=role_filter).order_by('-date_joined')
    else:
        users = User.objects.all().order_by('-date_joined')

    courses = Course.objects.all()
    enrollments = Enrollment.objects.all().order_by('-enrolled_at')[:10]

    active_users_count = UserSession.objects.count()
    recent_signups_count = User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=7)).count()

    return render(request, 'admin_dashboard.html', {
        'users': users,
        'courses': courses,
        'enrollments': enrollments,
        'current_role': role_filter,
        'total_filtered_users': users.count(),
        'active_users_count': active_users_count,
        'recent_signups_count': recent_signups_count
    })

# ------------------ COURSE DETAIL ------------------
def course_detail(request, course_id):
    course = Course.objects.get(id=course_id)
    videos = Video.objects.filter(course=course).order_by('order')
    
    # Check if enrolled
    is_enrolled = False
    if request.user.is_authenticated:
        is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()

    return render(request, 'course_detail.html', {
        'course': course,
        'videos': videos,
        'is_enrolled': is_enrolled
    })

# ------------------ ENROLL COURSE ------------------
@login_required
def enroll_course(request, course_id):
    course = Course.objects.get(id=course_id)
    Enrollment.objects.get_or_create(student=request.user, course=course, defaults={'progress': 0, 'status': 'Not Started'})
    return redirect('/dashboard/')

# ------------------ WATCH VIDEO ------------------
@login_required
def watch_video(request, course_id, video_id):
    from django.http import HttpResponseForbidden
    from core.models import VideoProgress

    course = Course.objects.get(id=course_id)
    video = Video.objects.get(id=video_id, course=course)
    
    # Verify enrollment
    enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
    if not enrollment:
        return HttpResponseForbidden("You must be enrolled to watch this video.")
        
    # Update last watched
    enrollment.last_watched_video = video
    if enrollment.status == 'Not Started':
        enrollment.status = 'In Progress'
    enrollment.save()
    
    # Get all course videos for sidebar playlist
    videos = Video.objects.filter(course=course).order_by('order')
    
    # Get user progress for this course's videos
    completed_video_ids = VideoProgress.objects.filter(student=request.user, video__course=course, is_completed=True).values_list('video_id', flat=True)

    return render(request, 'video_player.html', {
        'course': course,
        'current_video': video,
        'videos': videos,
        'completed_video_ids': list(completed_video_ids),
        'enrollment': enrollment
    })

# ------------------ UPDATE PROGRESS ------------------
@login_required
def mark_video_completed(request, video_id):
    from django.http import JsonResponse
    from core.models import VideoProgress
    
    if request.method == 'POST':
        video = Video.objects.get(id=video_id)
        course = video.course
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        
        if enrollment:
            # Mark video as complete
            VideoProgress.objects.update_or_create(
                student=request.user, 
                video=video,
                defaults={'is_completed': True}
            )
            
            # Recalculate progress
            total_videos = Video.objects.filter(course=course).count()
            completed_videos = VideoProgress.objects.filter(student=request.user, video__course=course, is_completed=True).count()
            
            progress_pct = int((completed_videos / total_videos) * 100) if total_videos > 0 else 0
            enrollment.progress = progress_pct
            if progress_pct == 100:
                enrollment.status = 'Completed'
            enrollment.save()
            
            return JsonResponse({'status': 'success', 'progress': progress_pct})
            
    return JsonResponse({'status': 'error'}, status=400)

# ------------------ QUIZ SYSTEM ------------------
@login_required
def take_quiz(request, course_id):
    from django.shortcuts import get_object_or_404
    from django.http import HttpResponseForbidden
    from core.models import Quiz, QuizAttempt
    
    course = get_object_or_404(Course, id=course_id)
    enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
    
    if not enrollment or enrollment.progress < 100:
        return HttpResponseForbidden("You must complete the course to take the quiz.")
        
    quiz = getattr(course, 'quiz', None)
    if not quiz:
        return render(request, 'quiz.html', {'error': 'No quiz available for this course yet.', 'course': course})
        
    previous_attempt = QuizAttempt.objects.filter(student=request.user, quiz=quiz, passed=True).first()
    if previous_attempt:
        return render(request, 'quiz.html', {
            'message': f'You have already passed this quiz with a score of {previous_attempt.score}%', 
            'passed': True, 
            'course': course
        })
        
    if request.method == 'POST':
        score = 0
        total = quiz.question_set.count()
        if total == 0:
            return render(request, 'quiz.html', {'error': 'Quiz has no questions.', 'course': course})
            
        for question in quiz.question_set.all():
            selected_choice_id = request.POST.get(f'question_{question.id}')
            if selected_choice_id:
                is_correct = question.choices.filter(id=selected_choice_id, is_correct=True).exists()
                if is_correct:
                    score += 1
                    
        percentage = int((score / total) * 100)
        passed = percentage >= 70
        
        QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=percentage,
            passed=passed
        )
        
        return render(request, 'quiz.html', {
            'score': percentage,
            'passed': passed,
            'completed': True,
            'course': course
        })
        
    return render(request, 'quiz.html', {'quiz': quiz, 'course': course})

# ------------------ CERTIFICATE ------------------
@login_required
def download_certificate(request, course_id):
    from django.shortcuts import get_object_or_404
    from django.http import HttpResponseForbidden
    from core.models import Certificate, QuizAttempt
    
    course = get_object_or_404(Course, id=course_id)
    enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
    
    if not enrollment or enrollment.progress < 100:
        return HttpResponseForbidden("You must complete the course to get a certificate.")
        
    quiz = getattr(course, 'quiz', None)
    if quiz:
        passed_attempt = QuizAttempt.objects.filter(student=request.user, quiz=quiz, passed=True).exists()
        if not passed_attempt:
            return HttpResponseForbidden("You must pass the course assessment to get a certificate.")
            
    certificate, created = Certificate.objects.get_or_create(
        student=request.user,
        course=course
    )
    
    return render(request, 'certificate.html', {'certificate': certificate})