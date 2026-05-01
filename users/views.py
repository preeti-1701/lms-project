from django.shortcuts import render, redirect
from django.http import HttpResponse

# ✅ use ONLY CustomUser
from .models import User as CustomUser
from .models import Course, Video, Enrollment


# ================= LOGIN =================
def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        try:
            user = CustomUser.objects.get(email=email, password=password)

            request.session['user_id'] = user.id
            request.session['user_email'] = user.email
            request.session['role'] = user.role

            # handle next redirect
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)

            if user.role == "trainer":
                return redirect('/trainer/')
            elif user.role == "student":
                return redirect('/dashboard/')
            elif user.role == "admin":
                return redirect('/admin/')

        except:
            return HttpResponse("Invalid login ❌")

    return render(request, 'users/login.html')


# ================= DASHBOARD =================
def dashboard(request):
    if request.session.get('role') != "student":
        return render(request, 'users/access_denied.html')

    return render(request, 'users/dashboard.html')


# ================= ADD COURSE =================
def add_course(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('/login/')

    user = CustomUser.objects.get(id=user_id)

    if user.role != "trainer":
        return HttpResponse("Access Denied ❌")

    if request.method == "POST":
        Course.objects.create(
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            trainer=user,
            topics=request.POST.get('topics'),
            duration=request.POST.get('duration'),
            status=request.POST.get('status')
        )
        return HttpResponse("Course Added ✅")

    return render(request, 'users/add_course.html')


# ================= VIEW COURSES =================
def view_courses(request):
    courses = Course.objects.filter(is_active=True)
    return render(request, 'users/view_courses.html', {'courses': courses})


# ================= ENROLL =================
def enroll(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return HttpResponse("Login first")

    user = CustomUser.objects.get(id=user_id)

    course_id = request.GET.get('course_id')
    course = Course.objects.get(id=course_id)

    Enrollment.objects.get_or_create(
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

    return render(request, 'users/course_videos.html', {
        'course': course,
        'videos': videos,
        'progress': enrollment.progress,
        'user_id': user_id
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

    return render(request, 'trainer_dashboard.html', {
        'courses': courses
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

        if request.method == "POST":
           if "toggle_status" in request.POST:
               course.is_active = not course.is_active
        course.save()

    return render(request, 'trainer_course.html', {
        'course': course,
        'videos': videos,
        'students': students
    })

from reportlab.pdfgen import canvas
from django.http import HttpResponse

def generate_certificate(request, course_id):
    user_id = request.session.get('user_id')
    user = CustomUser.objects.get(id=user_id)
    course = Course.objects.get(id=course_id)

    enrollment = Enrollment.objects.get(student=user, course=course)

    if enrollment.progress < 100:
        return HttpResponse("Complete course first")

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="certificate.pdf"'

    p = canvas.Canvas(response)
    p.drawString(200, 750, "Certificate of Completion")
    p.drawString(200, 700, f"{user}")
    p.drawString(200, 650, f"Completed {course.title}")

    p.save()
    return response