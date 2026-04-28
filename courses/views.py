from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
import uuid
from .models import Course, Video, VideoProgress, Quiz, Question, QuizAttempt, Certificate, Notification
from accounts.models import CustomUser


def notify(user, message, link=''):
    Notification.objects.create(user=user, message=message, link=link)


@login_required
def course_list(request):
    if request.user.role == 'admin':
        courses = Course.objects.all()
    elif request.user.role == 'trainer':
        courses = Course.objects.filter(created_by=request.user)
    else:
        courses = request.user.enrolled_courses.filter(is_active=True)
    return render(request, 'courses/course_list.html', {'courses': courses})


@login_required
def create_course(request):
    if request.user.role not in ['admin', 'trainer']:
        return redirect('dashboard')
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        thumbnail = request.POST.get('thumbnail', '')
        course = Course.objects.create(
            title=title, description=description,
            created_by=request.user, thumbnail=thumbnail
        )
        student_ids = request.POST.getlist('students')
        course.assigned_students.set(student_ids)
        for sid in student_ids:
            try:
                student = CustomUser.objects.get(id=sid)
                notify(student, f'You have been enrolled in "{title}"!', f'/courses/{course.id}/')
            except:
                pass
        messages.success(request, f'Course "{title}" created!')
        return redirect('course_list')
    students = CustomUser.objects.filter(role='student', is_active=True)
    return render(request, 'courses/create_course.html', {'students': students})


@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.user.role == 'student':
        if course not in request.user.enrolled_courses.all():
            messages.error(request, 'You are not enrolled in this course.')
            return redirect('dashboard')
    videos = course.videos.all()
    progress_map = {}
    if request.user.role == 'student':
        for v in videos:
            try:
                p = VideoProgress.objects.get(student=request.user, video=v)
                progress_map[v.id] = p.percentage
            except VideoProgress.DoesNotExist:
                progress_map[v.id] = 0
    total_videos = videos.count()
    completed = sum(1 for v in videos if progress_map.get(v.id, 0) >= 80)
    course_progress = int((completed / total_videos) * 100) if total_videos > 0 else 0
    return render(request, 'courses/course_detail.html', {
        'course': course, 'videos': videos,
        'progress_map': progress_map, 'course_progress': course_progress,
    })


@login_required
def add_video(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.user.role not in ['admin', 'trainer']:
        return redirect('dashboard')
    if request.method == 'POST':
        title = request.POST.get('title')
        youtube_url = request.POST.get('youtube_url')
        order = request.POST.get('order', 0)
        video = Video.objects.create(
            course=course, title=title,
            youtube_url=youtube_url, order=order
        )
        for student in course.assigned_students.all():
            notify(student, f'New video "{title}" added in "{course.title}"!',
                   f'/courses/video/{video.id}/watch/')
        messages.success(request, f'Video "{title}" added!')
        return redirect('course_detail', course_id=course.id)
    return render(request, 'courses/add_video.html', {'course': course})


@login_required
def watch_video(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    course = video.course
    if request.user.role == 'student':
        if course not in request.user.enrolled_courses.all():
            messages.error(request, 'Access denied.')
            return redirect('dashboard')
    youtube_id = video.get_youtube_id()
    watermark = request.user.full_name + ' | ' + request.user.email
    progress = None
    quiz = None
    attempt = None
    if request.user.role == 'student':
        progress, _ = VideoProgress.objects.get_or_create(
            student=request.user, video=video
        )
        try:
            quiz = video.quiz
            try:
                attempt = QuizAttempt.objects.get(student=request.user, quiz=quiz)
            except QuizAttempt.DoesNotExist:
                attempt = None
        except Quiz.DoesNotExist:
            quiz = None
    return render(request, 'courses/watch_video.html', {
        'video': video, 'course': course,
        'youtube_id': youtube_id, 'watermark': watermark,
        'progress': progress, 'quiz': quiz, 'attempt': attempt,
    })


@login_required
def update_progress(request, video_id):
    if request.method == 'POST' and request.user.role == 'student':
        video = get_object_or_404(Video, id=video_id)
        import json
        data = json.loads(request.body)
        watched = int(data.get('watched', 0))
        duration = int(data.get('duration', 0))
        progress, _ = VideoProgress.objects.get_or_create(
            student=request.user, video=video
        )
        if watched > progress.watched_seconds:
            progress.watched_seconds = watched
        if duration > 0:
            progress.duration_seconds = duration
        if progress.percentage >= 80:
            progress.completed = True
            check_certificate(request.user, video.course)
        progress.save()
        return JsonResponse({'percentage': progress.percentage, 'completed': progress.completed})
    return JsonResponse({'error': 'invalid'}, status=400)


def check_certificate(student, course):
    videos = course.videos.all()
    if videos.count() == 0:
        return
    completed = VideoProgress.objects.filter(
        student=student, video__in=videos, completed=True
    ).count()
    if completed >= videos.count():
        if not Certificate.objects.filter(student=student, course=course).exists():
            cert_id = 'LMS' + str(uuid.uuid4()).upper()[:8]
            Certificate.objects.create(
                student=student, course=course, certificate_id=cert_id
            )
            notify(student,
                   f'🎉 Congratulations! You earned a certificate for "{course.title}"!',
                   f'/courses/certificate/{course.id}/')


@login_required
def take_quiz(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    quiz = get_object_or_404(Quiz, video=video)
    if QuizAttempt.objects.filter(student=request.user, quiz=quiz).exists():
        messages.info(request, 'You have already attempted this quiz.')
        return redirect('watch_video', video_id=video.id)
    if request.method == 'POST':
        questions = quiz.questions.all()
        score = 0
        for q in questions:
            answer = request.POST.get(f'q_{q.id}')
            if answer == q.correct_option:
                score += 1
        passed = score >= (questions.count() * 0.6)
        attempt = QuizAttempt.objects.create(
            student=request.user, quiz=quiz,
            score=score, total=questions.count(), passed=passed
        )
        if passed:
            notify(request.user,
                   f'✅ You passed the quiz for "{video.title}" with {attempt.percentage}%!',
                   f'/courses/video/{video.id}/watch/')
        else:
            notify(request.user,
                   f'❌ You scored {attempt.percentage}% in quiz for "{video.title}". Keep going!',
                   f'/courses/video/{video.id}/watch/')
        return redirect('quiz_result', video_id=video.id)
    questions = quiz.questions.all()
    return render(request, 'courses/take_quiz.html', {
        'quiz': quiz, 'questions': questions, 'video': video
    })


@login_required
def quiz_result(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    quiz = get_object_or_404(Quiz, video=video)
    attempt = get_object_or_404(QuizAttempt, student=request.user, quiz=quiz)
    return render(request, 'courses/quiz_result.html', {
        'attempt': attempt, 'video': video, 'quiz': quiz
    })


@login_required
def create_quiz(request, video_id):
    if request.user.role not in ['admin', 'trainer']:
        return redirect('dashboard')
    video = get_object_or_404(Video, id=video_id)
    if hasattr(video, 'quiz'):
        messages.info(request, 'Quiz already exists for this video.')
        return redirect('course_detail', course_id=video.course.id)
    if request.method == 'POST':
        quiz = Quiz.objects.create(video=video, title=f'Quiz - {video.title}')
        questions_data = []
        i = 1
        while request.POST.get(f'q{i}_text'):
            Question.objects.create(
                quiz=quiz,
                text=request.POST.get(f'q{i}_text'),
                option_a=request.POST.get(f'q{i}_a'),
                option_b=request.POST.get(f'q{i}_b'),
                option_c=request.POST.get(f'q{i}_c'),
                option_d=request.POST.get(f'q{i}_d'),
                correct_option=request.POST.get(f'q{i}_correct'),
            )
            i += 1
        messages.success(request, 'Quiz created successfully!')
        return redirect('course_detail', course_id=video.course.id)
    return render(request, 'courses/create_quiz.html', {'video': video})


@login_required
def view_certificate(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    cert = get_object_or_404(Certificate, student=request.user, course=course)
    return render(request, 'courses/certificate.html', {
        'cert': cert, 'course': course, 'student': request.user
    })


@login_required
def leaderboard(request):
    attempts = QuizAttempt.objects.filter(passed=True).values(
        'student__full_name', 'student__id'
    )
    from django.db.models import Count, Avg
    board = QuizAttempt.objects.values(
        'student__full_name'
    ).annotate(
        passed_count=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(passed=True)),
        avg_score=Avg('score')
    ).order_by('-passed_count', '-avg_score')[:10]
    return render(request, 'courses/leaderboard.html', {'board': board})


@login_required
def analytics(request):
    if request.user.role not in ['admin', 'trainer']:
        return redirect('dashboard')
    from django.db.models import Count
    total_users = CustomUser.objects.count()
    total_courses = Course.objects.count()
    total_videos = Video.objects.count()
    total_students = CustomUser.objects.filter(role='student').count()
    total_trainers = CustomUser.objects.filter(role='trainer').count()
    video_views = VideoProgress.objects.count()
    completed_videos = VideoProgress.objects.filter(completed=True).count()
    quiz_attempts = QuizAttempt.objects.count()
    passed_quizzes = QuizAttempt.objects.filter(passed=True).count()
    certificates_issued = Certificate.objects.count()
    top_courses = Course.objects.annotate(
        student_count=Count('assigned_students')
    ).order_by('-student_count')[:5]
    return render(request, 'courses/analytics.html', {
        'total_users': total_users,
        'total_courses': total_courses,
        'total_videos': total_videos,
        'total_students': total_students,
        'total_trainers': total_trainers,
        'video_views': video_views,
        'completed_videos': completed_videos,
        'quiz_attempts': quiz_attempts,
        'passed_quizzes': passed_quizzes,
        'certificates_issued': certificates_issued,
        'top_courses': top_courses,
    })


@login_required
def notifications_view(request):
    notifs = request.user.notifications.all()
    notifs.filter(is_read=False).update(is_read=True)
    return render(request, 'courses/notifications.html', {'notifications': notifs})


@login_required
def unread_notifications(request):
    count = request.user.notifications.filter(is_read=False).count()
    notifs = list(request.user.notifications.filter(
        is_read=False).values('message', 'link', 'created_at')[:5])
    return JsonResponse({'count': count, 'notifications': notifs})


@login_required
def assign_students(request, course_id):
    if request.user.role not in ['admin', 'trainer']:
        return redirect('dashboard')
    course = get_object_or_404(Course, id=course_id)
    if request.method == 'POST':
        student_ids = request.POST.getlist('students')
        old_students = set(course.assigned_students.values_list('id', flat=True))
        course.assigned_students.set(student_ids)
        new_students = set(int(i) for i in student_ids) - old_students
        for sid in new_students:
            try:
                student = CustomUser.objects.get(id=sid)
                notify(student,
                       f'You have been enrolled in "{course.title}"!',
                       f'/courses/{course.id}/')
            except:
                pass
        messages.success(request, 'Students assigned!')
        return redirect('course_detail', course_id=course.id)
    students = CustomUser.objects.filter(role='student', is_active=True)
    return render(request, 'courses/assign_students.html', {
        'course': course, 'students': students,
        'assigned': course.assigned_students.all(),
    })