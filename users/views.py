from django.http import JsonResponse
import json
from courses.models import Course, Enrollment
from .models import User
from django.shortcuts import render
from user_sessions.models import UserSession
from django.contrib.sessions.models import Session
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        try:
            user = User.objects.get(email=email, password=password)

            request.session['user_name'] = user.name

            return JsonResponse({
                "message": "Login successful",
                "role": user.role   # ⭐ VERY IMPORTANT
            })

        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid credentials"})

    return JsonResponse({"message": "Use POST request"})

@csrf_exempt
def logout(request):
    session_key = request.session.session_key

    if session_key:
        UserSession.objects.filter(session_key=session_key).update(is_active=False)

    request.session.flush()

    return JsonResponse({"message": "Logged out"})

def login_page(request):
    return render(request, 'login.html')

def student_page(request):
    return render(request, 'student.html')

def admin_page(request):
    total_users = User.objects.count()
    total_courses = Course.objects.count()
    total_students = User.objects.filter(role='student').count()

    courses = Course.objects.all()
    enrollments = Enrollment.objects.select_related('student', 'course')

    return render(request, 'admin_dashboard.html', {
        'total_users': total_users,
        'total_courses': total_courses,
        'total_students': total_students,
        'courses': courses,
        'enrollments': enrollments
    })

def trainer_page(request):
    user_name = request.session.get('user_name')
    user = User.objects.filter(name=user_name).first()

    courses = Course.objects.filter(trainer=user)

    return render(request, 'trainer.html', {
        'courses': courses,
        'user_name': user.name
    })