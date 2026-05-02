from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render, redirect

from .models import User
from llsm.courses.models import Course, Video, Enrollment

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect('dashboard')

    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect('login')


@login_required
def dashboard(request):
    user = request.user

    if user.role == 'admin':
        if request.method == 'POST':
            action = request.POST.get('action')

            if action == 'create_user':
                username = request.POST.get('username', '').strip()
                email = request.POST.get('email', '').strip()
                password = request.POST.get('password', '')
                role = request.POST.get('role', 'student')

                if role not in {'student', 'trainer'}:
                    role = 'student'

                if not username or not email or not password:
                    messages.error(request, 'Username, email, and password are required.')
                elif User.objects.filter(username=username).exists():
                    messages.error(request, 'That username is already taken.')
                elif User.objects.filter(email=email).exists():
                    messages.error(request, 'That email is already registered.')
                else:
                    User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        role=role,
                    )
                    messages.success(request, f'{role.title()} account created successfully.')

            elif action == 'enroll_student':
                student_id = request.POST.get('student_id')
                course_id = request.POST.get('course_id')
                
                try:
                    student = User.objects.get(id=student_id, role='student')
                    course = Course.objects.get(id=course_id)
                    
                    if Enrollment.objects.filter(student=student, course=course).exists():
                        messages.warning(request, f'{student.username} is already enrolled in {course.title}.')
                    else:
                        Enrollment.objects.create(student=student, course=course)
                        messages.success(request, f'{student.username} enrolled in {course.title} successfully.')
                except User.DoesNotExist:
                    messages.error(request, 'Student not found.')
                except Course.DoesNotExist:
                    messages.error(request, 'Course not found.')

            return redirect('dashboard')

        users = User.objects.filter(role__in=['student', 'trainer']).order_by('role', 'username')
        students = User.objects.filter(role='student').order_by('username')
        courses = Course.objects.all().order_by('title')
        enrollments = Enrollment.objects.select_related('student', 'course').order_by('-created_at')
        
        return render(
            request,
            'admin_dashboard.html',
            {
                'users': users,
                'students': students,
                'courses': courses,
                'enrollments': enrollments,
            },
        )
    elif user.role == 'trainer':
        if request.method == 'POST':
            action = request.POST.get('action')

            if action == 'create_student':
                username = request.POST.get('username', '').strip()
                email = request.POST.get('email', '').strip()
                password = request.POST.get('password', '')

                if not username or not email or not password:
                    messages.error(request, 'Username, email, and password are required.')
                elif User.objects.filter(username=username).exists():
                    messages.error(request, 'That username is already taken.')
                elif User.objects.filter(email=email).exists():
                    messages.error(request, 'That email is already registered.')
                else:
                    User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        role='student',
                    )
                    messages.success(request, 'Student account created successfully.')

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