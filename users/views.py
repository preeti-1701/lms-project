from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import User, Course
from .models import Enrollment


# LOGIN
def login_view(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')

        print(email, password)  # 👈 DEBUG

        user = User.objects.filter(email=email, password=password).first()

        if user:
            return redirect(f"/dashboard/?email={email}")
        else:
            return HttpResponse("Invalid Login ❌")

    return render(request, "users/login.html")

# DASHBOARD
def dashboard(request):
    email = request.GET.get('email')
    user = User.objects.get(email=email)

    return render(request, 'users/dashboard.html', {'user': user, 'email': email})


# ADD COURSE (Trainer)
def add_course(request):
    email = request.GET.get('email')
    user = User.objects.get(email=email)

    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        topics = request.POST.get('topics')
        duration = request.POST.get('duration')
        status = request.POST.get('status')

        Course.objects.create(
            title=title,
            description=description,
            trainer=user,
            topics=topics,
            duration=duration,
            status=status
        )

        return HttpResponse("Course Added ✅")

    return render(request, 'users/add_course.html', {'email': email})

# VIEW COURSES (Student)
def view_courses(request):
    email = request.GET.get('email')
    user = User.objects.get(email=email)

    if user.role == "trainer":
        courses = Course.objects.filter(trainer=user)
    else:
        courses = Course.objects.filter(status="active")

    return render(request, 'users/view_courses.html', {
        'courses': courses,
        'email': email
    })

def enroll(request):
    email = request.GET.get('email')
    course_id = request.GET.get('course_id')

    if not email:
        return HttpResponse("Login again ❌")

    user = User.objects.get(email=email)
    course = Course.objects.get(id=course_id)

    if Enrollment.objects.filter(student=user, course=course).exists():
        return HttpResponse("Already Enrolled ⚠️")

    Enrollment.objects.create(student=user, course=course)

    return HttpResponse("Enrolled Successfully ✅")

def my_courses(request):
    email = request.GET.get('email')
    user = User.objects.get(email=email)

    enrollments = Enrollment.objects.filter(student=user)

    return render(request, 'users/my_courses.html', {
        'enrollments': enrollments,
        'email': email
    })

