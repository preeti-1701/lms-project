from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import authenticate, login
from llsm.courses.models import Course, Video

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect('dashboard')

    return render(request, 'login.html')


@login_required
def dashboard(request):
    user = request.user

    if user.role == 'admin':
        return render(request, 'admin_dashboard.html')
    elif user.role == 'trainer':
        if request.method == 'POST':
            action = request.POST.get('action')

            if action == 'create_course':
                title = request.POST.get('title', '').strip()
                description = request.POST.get('description', '').strip()
                status = request.POST.get('status', 'upcoming')

                if status not in {'upcoming', 'active'}:
                    status = 'upcoming'

                if not title or not description:
                    messages.error(request, 'Course title and description are required.')
                else:
                    Course.objects.create(
                        title=title,
                        description=description,
                        status=status,
                        created_by=user,
                    )
                    messages.success(request, 'Course created successfully.')

            elif action == 'add_video':
                course_id = request.POST.get('course_id')
                title = request.POST.get('title', '').strip()
                youtube_link = request.POST.get('youtube_link', '').strip()
                course = get_object_or_404(Course, id=course_id, created_by=user)

                if not title or not youtube_link:
                    messages.error(request, 'Video title and YouTube link are required.')
                else:
                    Video.objects.create(
                        course=course,
                        title=title,
                        youtube_link=youtube_link,
                    )
                    messages.success(request, f'Video added to {course.title}.')

            return redirect('dashboard')

        trainer_courses = Course.objects.filter(created_by=user).prefetch_related('video_set').order_by('title')
        return render(
            request,
            'trainer_dashboard.html',
            {
                'trainer_courses': trainer_courses,
            },
        )
    else:
        enrolled_courses = (
            Course.objects.filter(enrollment__student=user)
            .select_related('created_by')
            .prefetch_related('video_set')
            .distinct()
        )

        all_courses = Course.objects.select_related('created_by').order_by('title')
        enrolled_ids = set(enrolled_courses.values_list('id', flat=True))

        return render(
            request,
            'student_dashboard.html',
            {
                'all_courses': all_courses,
                'enrolled_courses': enrolled_courses,
                'enrolled_ids': enrolled_ids,
            },
        )