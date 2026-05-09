# ============================================
# LMS APP VIEWS
# FILE: lms_app/views.py
# ============================================

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse

import json

from .models import Course, Video, Enrollment, Profile


# ============================================
# SIGNUP
# ============================================

def signup(request):

    if request.method == "POST":

        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        role = request.POST.get('role', 'student')

        # VALIDATION
        if not username or not password:

            messages.error(
                request,
                "Username and Password are required"
            )

            return redirect('signup')

        # USER EXISTS
        if User.objects.filter(username=username).exists():

            messages.error(
                request,
                "Username already exists"
            )

            return redirect('signup')

        # CREATE USER
        user = User.objects.create_user(

            username=username,
            email=email,
            password=password

        )

        # CREATE PROFILE
        Profile.objects.create(

            user=user,
            role=role

        )

        messages.success(
            request,
            "Account created successfully"
        )

        return redirect('login')

    return render(request, 'signup.html')


# ============================================
# LOGIN
# ============================================

def user_login(request):

    if request.method == "POST":

        username = request.POST.get(
            'username',
            ''
        ).strip()

        password = request.POST.get(
            'password',
            ''
        )

        user = authenticate(

            request,
            username=username,
            password=password

        )

        if user:

            login(request, user)

            profile, created = Profile.objects.get_or_create(
                user=user
            )

            # ROLE BASED LOGIN

            if profile.role == 'admin':

                return redirect('admin_dashboard')

            elif profile.role == 'trainer':

                return redirect('trainer_dashboard')

            else:

                return redirect('dashboard')

        else:

            messages.error(
                request,
                "Invalid username or password"
            )

    return render(request, 'login.html')


# ============================================
# LOGOUT
# ============================================

def user_logout(request):

    logout(request)

    messages.success(
        request,
        "Logged out successfully"
    )

    return redirect('login')


# ============================================
# STUDENT DASHBOARD
# ============================================

@login_required
def dashboard(request):

    profile = Profile.objects.get(
        user=request.user
    )

    # ONLY STUDENTS
    if profile.role != 'student':

        return redirect('login')

    courses = Course.objects.all()

    videos = Video.objects.all()

    enrolled_courses = Enrollment.objects.filter(
        student=request.user
    )

    return render(request, 'dashboard.html', {

        'courses': courses,

        'videos': videos,

        'enrolled_courses': enrolled_courses

    })


# ============================================
# MY COURSES
# ============================================

@login_required
def my_courses(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'student':

        return redirect('login')

    enrolled_courses = Enrollment.objects.filter(
        student=request.user
    )

    videos = Video.objects.all()

    return render(request, 'my_courses.html', {

        'enrolled_courses': enrolled_courses,

        'videos': videos

    })


# ============================================
# PROFILE
# ============================================

@login_required
def profile(request):

    profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    if request.method == "POST":

        profile.full_name = request.POST.get(
            'full_name'
        ) or None

        profile.roll_number = request.POST.get(
            'roll_number'
        ) or None

        profile.phone = request.POST.get(
            'phone'
        ) or None

        age = request.POST.get('age')

        profile.age = int(age) if age else None

        dob = request.POST.get('dob')

        profile.dob = dob if dob else None

        profile.college = request.POST.get(
            'college'
        ) or None

        profile.branch = request.POST.get(
            'branch'
        ) or None

        profile.save()

        messages.success(
            request,
            "Profile updated successfully"
        )

        return redirect('profile')

    return render(request, 'profile.html', {

        'profile': profile

    })


# ============================================
# ENROLL COURSE
# ============================================

@login_required
def enroll(request, id):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'student':

        return redirect('login')

    course = get_object_or_404(
        Course,
        id=id
    )

    enrollment, created = Enrollment.objects.get_or_create(

        student=request.user,

        course=course

    )

    if created:

        messages.success(
            request,
            "Enrolled successfully"
        )

    else:

        messages.info(
            request,
            "Already enrolled"
        )

    return redirect('dashboard')


# ============================================
# VIDEO PLAYER
# ============================================

@login_required
def open_video(request, id):

    course = get_object_or_404(
        Course,
        id=id
    )

    videos = Video.objects.filter(
        course=course
    ).order_by('order')

    enrollment = Enrollment.objects.filter(

        student=request.user,

        course=course

    ).first()

    progress = 0

    if enrollment:

        progress = enrollment.progress

    return render(request, 'videoplayer.html', {

        'course': course,

        'videos': videos,

        'progress': progress

    })


# ============================================
# UPDATE PROGRESS
# ============================================

@login_required
def update_progress(request, id):

    if request.method == "POST":

        try:

            data = json.loads(
                request.body
            )

            progress = int(
                data.get(
                    "progress",
                    0
                )
            )

        except:

            progress = 0

        enrollment = Enrollment.objects.filter(

            student=request.user,

            course_id=id

        ).first()

        if enrollment:

            # ONLY INCREASE PROGRESS

            if progress > enrollment.progress:

                enrollment.progress = min(
                    progress,
                    100
                )

                # MARK COMPLETE

                if enrollment.progress == 100:

                    enrollment.completed = True

                enrollment.save()

        return JsonResponse({

            "status": "ok"

        })

    return JsonResponse({

        "status": "error"

    })


# ============================================
# CERTIFICATE
# ============================================

@login_required
def certificate(request, id):

    course = get_object_or_404(
        Course,
        id=id
    )

    enrollment = Enrollment.objects.filter(

        student=request.user,

        course=course,

        completed=True

    ).first()

    # NOT COMPLETED

    if not enrollment:

        messages.error(
            request,
            "Complete the course first"
        )

        return redirect('dashboard')

    return render(request, 'certificate.html', {

        'course': course

    })


# ============================================
# ADMIN DASHBOARD
# ============================================

@login_required
def admin_dashboard(request):

    profile = Profile.objects.get(
        user=request.user
    )

    # ONLY ADMIN

    if profile.role != 'admin':

        return redirect('login')

    courses = Course.objects.all()

    users = User.objects.all()

    enrollments = Enrollment.objects.all()

    total_students = Profile.objects.filter(
        role='student'
    ).count()

    total_trainers = Profile.objects.filter(
        role='trainer'
    ).count()

    total_courses = Course.objects.count()

    return render(request, 'admin_dashboard.html', {

        'courses': courses,

        'users': users,

        'enrollments': enrollments,

        'total_students': total_students,

        'total_trainers': total_trainers,

        'total_courses': total_courses

    })


# ============================================
# ADMIN STUDENTS
# ============================================

@login_required
def admin_students(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'admin':

        return redirect('login')

    students = Profile.objects.filter(
        role='student'
    )

    return render(request, 'admin_students.html', {

        'students': students

    })


# ============================================
# ADMIN TRAINERS
# ============================================

@login_required
def admin_trainers(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'admin':

        return redirect('login')

    trainers = Profile.objects.filter(
        role='trainer'
    )

    return render(request, 'admin_trainers.html', {

        'trainers': trainers

    })


# ============================================
# ADMIN ANALYTICS
# ============================================

@login_required
def admin_analytics(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'admin':

        return redirect('login')

    total_students = Profile.objects.filter(
        role='student'
    ).count()

    total_trainers = Profile.objects.filter(
        role='trainer'
    ).count()

    total_courses = Course.objects.count()

    total_enrollments = Enrollment.objects.count()

    return render(request, 'admin_analytics.html', {

        'total_students': total_students,

        'total_trainers': total_trainers,

        'total_courses': total_courses,

        'total_enrollments': total_enrollments

    })


# ============================================
# ADD COURSE
# ============================================

@login_required
def add_course(request):

    profile = Profile.objects.get(
        user=request.user
    )

    # ONLY ADMIN

    if profile.role != 'admin':

        return redirect('login')

    if request.method == "POST":

        title = request.POST.get('title')

        category = request.POST.get('category')

        trainer = request.POST.get('trainer')

        price = request.POST.get('price')

        description = request.POST.get('description')

        duration = request.POST.get('duration')

        level = request.POST.get('level')

        image = request.FILES.get('image')

        youtube_link = request.POST.get(
            'youtube_link'
        )

        # CREATE COURSE

        Course.objects.create(

            title=title,

            category=category,

            trainer=trainer,

            price=price,

            description=description,

            duration=duration,

            level=level,

            image=image,

            youtube_link=youtube_link,

            created_by=request.user

        )

        messages.success(
            request,
            "Course added successfully"
        )

        return redirect('admin_dashboard')

    return render(request, 'add_courses.html')


# ============================================
# DELETE COURSE
# ============================================

@login_required
def delete_course(request, id):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'admin':

        return redirect('login')

    course = get_object_or_404(
        Course,
        id=id
    )

    course.delete()

    messages.success(
        request,
        "Course deleted successfully"
    )

    return redirect('admin_dashboard')


# ============================================
# TRAINER DASHBOARD
# ============================================

@login_required
def trainer_dashboard(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'trainer':

        return redirect('login')

    courses = Course.objects.all()

    total_students = Enrollment.objects.count()

    total_courses = Course.objects.count()

    total_videos = Video.objects.count()

    return render(request, 'trainer_dashboard.html', {

        'courses': courses,

        'total_students': total_students,

        'total_courses': total_courses,

        'total_videos': total_videos

    })


# ============================================
# TRAINER STUDENTS
# ============================================

@login_required
def trainer_students(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'trainer':

        return redirect('login')

    enrollments = Enrollment.objects.select_related(

        'student',

        'course'

    )

    return render(request, 'trainer_students.html', {

        'enrollments': enrollments

    })


# ============================================
# TRAINER LESSONS
# ============================================

@login_required
def trainer_lessons(request):

    profile = Profile.objects.get(
        user=request.user
    )

    if profile.role != 'trainer':

        return redirect('login')

    courses = Course.objects.all()

    return render(request, 'trainer_lessons.html', {

        'courses': courses

    })


# ============================================
# ADD LESSON
# ============================================

@login_required
def add_lesson(request, id):

    profile = Profile.objects.get(
        user=request.user
    )

    # ADMIN + TRAINER

    if profile.role not in ['admin', 'trainer']:

        return redirect('login')

    course = get_object_or_404(
        Course,
        id=id
    )

    if request.method == "POST":

        title = request.POST.get('title')

        youtube_link = request.POST.get(
            'youtube_link'
        )

        Video.objects.create(

            course=course,

            title=title,

            youtube_link=youtube_link,

            order=course.videos.count() + 1

        )

        messages.success(
            request,
            "Lesson added successfully"
        )

        if profile.role == 'admin':

            return redirect('admin_dashboard')

        return redirect('trainer_dashboard')

    return render(request, 'add_lesson.html', {

        'course': course

    })


# ============================================
# SECURITY ALERT
# ============================================

@login_required
def security_alert(request):

    if request.method == "POST":

        print(

            f"SECURITY ALERT: "
            f"{request.user.username} "
            f"performed suspicious activity"

        )

        return JsonResponse({

            "status": "ok"

        })

    return JsonResponse({

        "status": "error"

    })