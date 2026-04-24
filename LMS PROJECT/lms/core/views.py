from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

from reportlab.pdfgen import canvas
import re

from .models import Course, Video, Enrollment, Profile


# ================= LOGIN =================
def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid login'})

    return render(request, 'login.html')


# ================= LOGOUT =================
def logout_view(request):
    logout(request)
    return redirect('login')


# ================= DASHBOARD =================
@login_required
def dashboard(request):
    courses = Course.objects.all()
    enrollments = Enrollment.objects.filter(user=request.user)

    return render(request, 'dashboard.html', {
        'courses': courses,
        'enrollments': enrollments
    })


# ================= COURSE =================
@login_required
def course_detail(request, course_id):
    course = Course.objects.get(id=course_id)
    videos = Video.objects.filter(course=course)

    enrollment, created = Enrollment.objects.get_or_create(
        user=request.user,
        course=course
    )

    return render(request, 'course.html', {
        'course': course,
        'videos': videos,
        'enrollment': enrollment
    })


# ================= AUTO PROGRESS =================
@login_required
def update_progress(request, course_id):
    if request.method == "POST":
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course_id=course_id
        )

        if enrollment.progress < 100:
            enrollment.progress += 10
            if enrollment.progress > 100:
                enrollment.progress = 100
            enrollment.save()

        return JsonResponse({
            'status': 'success',
            'progress': enrollment.progress
        })

    return JsonResponse({'status': 'invalid request'})


# ================= PROFILE (FINAL) =================
@login_required
def profile(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    enrollments = Enrollment.objects.filter(user=request.user)

    error = None

    if request.method == "POST":
        phone = request.POST.get('phone')
        age = request.POST.get('age')
        birthdate = request.POST.get('birthdate')
        education = request.POST.get('education')

        # 🔥 PHONE VALIDATION
        if phone and not re.match(r'^\d{10}$', phone):
            error = "Phone number must be 10 digits"
        else:
            profile.phone = phone

        # 🔥 AGE SAFE
        profile.age = int(age) if age else None

        # 🔥 DATE SAFE
        profile.birthdate = birthdate if birthdate else None

        profile.education = education

        # FILE UPLOADS
        if request.FILES.get('profile_pic'):
            profile.profile_pic = request.FILES.get('profile_pic')

        if request.FILES.get('resume'):
            profile.resume = request.FILES.get('resume')

        if not error:
            profile.save()
            return redirect('profile')

    return render(request, 'profile.html', {
        'profile': profile,
        'enrollments': enrollments,
        'error': error
    })


# ================= CERTIFICATE =================
@login_required
def generate_certificate(request, course_id):
    enrollment = Enrollment.objects.get(
        user=request.user,
        course_id=course_id
    )

    if enrollment.progress < 100:
        return HttpResponse("Complete the course first")

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="certificate.pdf"'

    p = canvas.Canvas(response)

    p.setFont("Helvetica-Bold", 24)
    p.drawString(150, 750, "Certificate of Completion")

    p.setFont("Helvetica", 18)
    p.drawString(100, 700, "This certifies that")

    p.setFont("Helvetica-Bold", 20)
    p.drawString(100, 650, request.user.username)

    course = Course.objects.get(id=course_id)

    p.setFont("Helvetica", 16)
    p.drawString(100, 600, "has successfully completed")

    p.setFont("Helvetica-Bold", 18)
    p.drawString(100, 550, course.title)

    p.setFont("Helvetica", 14)
    p.drawString(100, 500, "Congratulations!")

    p.save()

    return response