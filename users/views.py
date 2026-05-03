from django.shortcuts import render, redirect
from django.http import HttpResponse

# ✅ use ONLY CustomUser
from .models import User as CustomUser
from .models import Course, Video, Enrollment
from .models import CompletedVideo


# ================= LOGIN =================
def login_view(request):
    if request.method == "POST":
        request.session.flush()
        email = request.POST.get("email")
        password = request.POST.get("password")

        try:
            user = CustomUser.objects.get(email=email)

            if user.password != password:
                return HttpResponse("Invalid password ❌")

            # 🔥 single session
            request.session.flush()

            request.session['user_id'] = user.id
            request.session['user_email'] = user.email
            request.session['role'] = user.role

            # 🔥 handle next
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)

            # 🔥 ROLE BASED REDIRECT
            if user.role == "admin":
                return redirect('/admin-dashboard/')   # ✅ FIXED
            elif user.role == "trainer":
                return redirect('/trainer/')
            else:
                return redirect('/dashboard/')

        except CustomUser.DoesNotExist:
            return HttpResponse("User not found ❌")

    return render(request, 'users/login.html')

# ================= ADD COURSE =================
def add_course(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('/login/')

    user = CustomUser.objects.get(id=user_id)

    if user.role != "admin":
        return HttpResponse("Access Denied ❌")

    if request.method == "POST":
        Course.objects.create(
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            trainer=None,
            topics=request.POST.get('topics'),
            duration=request.POST.get('duration'),
            status=request.POST.get('status')
        )
        return redirect('/admin-dashboard/')

    return render(request, 'users/add_course.html')


# ================= VIEW COURSES =================
def view_courses(request):
    courses = Course.objects.all()
    print("COURSES DATA:", courses)   # 👈 ADD THIS
    return render(request, 'users/view_courses.html', {'courses': courses})


# ================= ENROLL =================
def enroll(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Login first")

    user = CustomUser.objects.get(id=user_id)

    course_id = request.GET.get('course_id')
    course = Course.objects.get(id=course_id)

     # ✅ ADD THIS CHECK HERE
    if Enrollment.objects.filter(student=user, course=course).exists():
        return HttpResponse("Already Enrolled")

    Enrollment.objects.create(
        student=user,
        course=course
    )

    return HttpResponse("Enrolled successfully")


# ================= MY COURSES =================
def my_courses(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Login first")

    user = CustomUser.objects.get(id=user_id)

    enrollments = Enrollment.objects.filter(student=user)

    return render(request, 'users/my_courses.html', {
        'enrollments': enrollments
    })


# ================= COURSE VIDEOS =================
def course_videos(request, course_id):
    print("INSIDE COURSE VIDEOS")   # DEBUG

    course = Course.objects.get(id=course_id)

    user_id = request.session.get('user_id')
    if not user_id:
        return HttpResponse("Login first")

    user = CustomUser.objects.get(id=user_id)

    enrollment = Enrollment.objects.get(student=user, course=course)

    videos = Video.objects.filter(course=course)

    # 🔥 ADD THIS (new)
    completed_videos = CompletedVideo.objects.filter(
        student=user,
        video__course=course
    ).values_list('video_id', flat=True)

    return render(request, 'users/course_videos.html', {
        'course': course,
        'videos': videos,
        'progress': enrollment.progress,
        'user_id': user_id,
        'completed_videos': list(completed_videos)  # 🔥 ADD THIS
    })

# ================= LOGOUT =================
def logout_view(request):
    request.session.flush()
    return redirect('/login/')


# ================= TRAINER DASHBOARD =================
def trainer_dashboard(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('/login/')

    user = CustomUser.objects.get(id=user_id)

    if user.role != "trainer":
        return render(request, 'users/access_denied.html')

    courses = Course.objects.filter(trainer=user)

    # 🔥 ADD THIS
    enrollments = Enrollment.objects.filter(course__in=courses)

    return render(request, 'trainer_dashboard.html', {
        'courses': courses,
        'enrollments': enrollments   # 👈 important
    })


# ================= TRAINER COURSE =================
def trainer_course(request, id):
    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('/login/')

    user = CustomUser.objects.get(id=user_id)

    if user.role != "trainer":
        return HttpResponse("Access Denied ❌")

    course = Course.objects.get(id=id)

    # ensure trainer owns this course
    if course.trainer != user:
        return HttpResponse("Access Denied ❌")

    videos = Video.objects.filter(course=course)
    enrollments = Enrollment.objects.filter(course=course)
    students = [en.student for en in enrollments]

    if request.method == "POST":
     Video.objects.create(
        title=request.POST.get('title'),
        youtube_link=request.POST.get('youtube_link'),
        course=course
    )

    if "toggle_status" in request.POST:
        course.is_active = not course.is_active
        course.save()

    return render(request, 'trainer_course.html', {
        'course': course,
        'videos': videos,
        'students': students
    })

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from django.http import HttpResponse
from datetime import date

def generate_certificate(request, course_id):
    user_id = request.session.get('user_id')
    user = CustomUser.objects.get(id=user_id)
    course = Course.objects.get(id=course_id)

    enrollment = Enrollment.objects.get(student=user, course=course)

    if enrollment.progress < 90:
        return HttpResponse("Complete at least 90%")

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="certificate.pdf"'

    doc = SimpleDocTemplate(response, pagesize=A4)
    styles = getSampleStyleSheet()

    content = []

    # 🔥 TITLE
    content.append(Spacer(1, 100))
    content.append(Paragraph("<b>CERTIFICATE OF COMPLETION</b>", styles['Title']))
    content.append(Spacer(1, 40))

    # 🔥 BODY
    content.append(Paragraph("This is to certify that", styles['Normal']))
    content.append(Spacer(1, 15))

    content.append(Paragraph(f"<b>{user.email}</b>", styles['Heading2']))
    content.append(Spacer(1, 20))

    content.append(Paragraph("has successfully completed the course", styles['Normal']))
    content.append(Spacer(1, 15))

    content.append(Paragraph(f"<b>{course.title}</b>", styles['Heading3']))
    content.append(Spacer(1, 40))

    content.append(Paragraph("With dedication and excellence 🎓", styles['Normal']))
    content.append(Spacer(1, 60))

    # 🔥 DATE
    content.append(Paragraph(f"Date: {date.today()}", styles['Normal']))
    content.append(Spacer(1, 40))

    # 🔥 SIGNATURE TEXT
    content.append(Paragraph("__________________________", styles['Normal']))
    content.append(Paragraph("Authorized Signature", styles['Normal']))

    doc.build(content)

    return response
def admin_dashboard(request):
    if request.session.get('role') != "admin":
        return HttpResponse("Access Denied")

    users = CustomUser.objects.all()
    courses = Course.objects.all()

    return render(request, 'users/admin_dashboard.html', {
        'users': users,
        'courses': courses
    })

def dashboard(request):
    if request.session.get('role') != "student":
        return render(request, 'users/access_denied.html')

    return render(request, 'users/dashboard.html')

def update_progress(request, course_id, video_id):
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Login required")

    user = CustomUser.objects.get(id=user_id)
    video = Video.objects.get(id=video_id)
    enrollment = Enrollment.objects.get(student=user, course_id=course_id)

    total_videos = Video.objects.filter(course_id=course_id).count()

    # 🔥 SAVE TO DATABASE (IMPORTANT FIX)
    CompletedVideo.objects.get_or_create(
        student=user,
        video=video
    )

    # 🔥 OPTIONAL: keep session (not required but ok)
    completed = request.session.get('completed_videos', [])
    video_id = int(video_id)

    if video_id not in completed:
        completed.append(video_id)

    request.session['completed_videos'] = completed

    # 🔥 CALCULATE FROM DATABASE (NOT SESSION)
    completed_count = CompletedVideo.objects.filter(
        student=user,
        video__course_id=course_id
    ).count()

    # 🔥 SAFE CALCULATION
    if total_videos == 0:
        progress = 0
    else:
        progress = int((completed_count / total_videos) * 100)

    # 🔥 LIMIT
    if progress > 100:
        progress = 100

    enrollment.progress = progress
    enrollment.save()

    return HttpResponse("Updated")


def delete_course(request, id):
    if request.session.get('role') != "admin":
        return HttpResponse("Access Denied ❌")

    Course.objects.get(id=id).delete()
    return redirect('/admin-dashboard/')

def delete_user(request, id):
    if request.session.get('role') != "admin":
        return HttpResponse("Access Denied ❌")

    CustomUser.objects.get(id=id).delete()
    return redirect('/admin-dashboard/')