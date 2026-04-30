"""Server-rendered HTML pages for courses (Bootstrap UI)."""
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponseForbidden, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Course, Enrollment, Lesson, LessonProgress


def _is_admin(user) -> bool:
    return user.is_authenticated and (user.is_superuser or getattr(user, 'is_admin_role', False))


def course_list_page(request):
    """Public listing of all courses, with progress for enrolled users."""
    courses = list(Course.objects.select_related('instructor').all())
    progress_map = {}
    if request.user.is_authenticated:
        enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
        progress_map = {e.course_id: e.progress_percentage for e in enrollments}
    # Annotate each course with the user's enrollment + progress for the template.
    for c in courses:
        c.user_enrolled = c.id in progress_map
        c.user_progress = progress_map.get(c.id, 0)
    return render(request, 'course_list.html', {
        'courses': courses,
        'is_admin': _is_admin(request.user),
    })


def course_detail_page(request, pk):
    """Course detail + lesson list with completion checkboxes for enrolled students."""
    course = get_object_or_404(Course, pk=pk)
    is_enrolled = False
    progress_pct = 0
    completed_ids = set()
    if request.user.is_authenticated:
        is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
        if is_enrolled:
            completed_ids = set(
                LessonProgress.objects.filter(
                    student=request.user, lesson__course=course, completed=True
                ).values_list('lesson_id', flat=True)
            )
            total = course.lessons.count()
            progress_pct = int(round((len(completed_ids) / total) * 100)) if total else 0

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return redirect('login-page')
        try:
            Enrollment.objects.create(student=request.user, course=course)
            messages.success(request, f'You are now enrolled in "{course.title}".')
        except IntegrityError:
            messages.info(request, 'You are already enrolled in this course.')
        return redirect('course-detail-page', pk=pk)

    lessons = list(course.lessons.all())
    # Annotate completion flag for template convenience
    for l in lessons:
        l.is_completed = l.id in completed_ids

    return render(request, 'course_detail.html', {
        'course': course,
        'lessons': lessons,
        'is_enrolled': is_enrolled,
        'is_admin': _is_admin(request.user),
        'progress_pct': progress_pct,
        'total_lessons': len(lessons),
        'completed_count': len(completed_ids),
    })


@login_required
@require_POST
def lesson_toggle_complete(request, pk):
    """HTML/JSON endpoint for the checkbox on the course detail page."""
    lesson = get_object_or_404(Lesson, pk=pk)
    if not Enrollment.objects.filter(student=request.user, course=lesson.course).exists():
        return JsonResponse({'error': 'Not enrolled.'}, status=403)

    completed = request.POST.get('completed', 'true').lower() in ('1', 'true', 'on', 'yes')
    progress, _ = LessonProgress.objects.get_or_create(student=request.user, lesson=lesson)
    progress.completed = completed
    progress.completed_at = timezone.now() if completed else None
    progress.save()

    enrollment = Enrollment.objects.get(student=request.user, course=lesson.course)
    return JsonResponse({
        'lesson_id': lesson.id,
        'completed': progress.completed,
        'progress_percentage': enrollment.progress_percentage,
        'completed_lessons': enrollment.completed_lessons,
        'total_lessons': enrollment.total_lessons,
    })


@login_required
def course_create_page(request):
    """Admin form to create a new course."""
    if not _is_admin(request.user):
        return HttpResponseForbidden('Only admins can create courses.')

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        video_url = request.POST.get('video_url', '').strip()
        if not title:
            messages.error(request, 'Title is required.')
        else:
            course = Course.objects.create(
                title=title, description=description,
                video_url=video_url, instructor=request.user,
            )
            messages.success(request, f'Course "{course.title}" created. Now add lessons.')
            return redirect('course-edit-page', pk=course.pk)

    return render(request, 'course_form.html', {'mode': 'create'})


@login_required
def course_edit_page(request, pk):
    """Admin form to edit a course AND manage its lessons."""
    course = get_object_or_404(Course, pk=pk)
    if not _is_admin(request.user):
        return HttpResponseForbidden('Only admins can edit courses.')

    if request.method == 'POST':
        action = request.POST.get('action', 'save_course')

        if action == 'save_course':
            course.title = request.POST.get('title', course.title).strip() or course.title
            course.description = request.POST.get('description', course.description)
            course.video_url = request.POST.get('video_url', course.video_url).strip()
            course.save()
            messages.success(request, 'Course updated.')

        elif action == 'add_lesson':
            ltitle = request.POST.get('lesson_title', '').strip()
            if ltitle:
                next_order = (course.lessons.count() or 0) + 1
                Lesson.objects.create(
                    course=course,
                    title=ltitle,
                    content=request.POST.get('lesson_content', '').strip(),
                    video_url=request.POST.get('lesson_video_url', '').strip(),
                    order=next_order,
                )
                messages.success(request, f'Lesson "{ltitle}" added.')
            else:
                messages.error(request, 'Lesson title is required.')

        elif action == 'delete_lesson':
            lid = request.POST.get('lesson_id')
            Lesson.objects.filter(pk=lid, course=course).delete()
            messages.success(request, 'Lesson removed.')

        return redirect('course-edit-page', pk=course.pk)

    return render(request, 'course_form.html', {
        'mode': 'edit', 'course': course, 'lessons': course.lessons.all(),
    })


@login_required
def course_delete_page(request, pk):
    """Admin action to delete a course."""
    course = get_object_or_404(Course, pk=pk)
    if not _is_admin(request.user):
        return HttpResponseForbidden('Only admins can delete courses.')

    if request.method == 'POST':
        title = course.title
        course.delete()
        messages.success(request, f'Deleted course "{title}".')
        return redirect('dashboard')

    return render(request, 'course_confirm_delete.html', {'course': course})
