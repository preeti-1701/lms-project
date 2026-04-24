from django.shortcuts import render, redirect
from .models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import render
from django.contrib.auth.hashers import check_password
import random
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import Profile
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from .models import Course, Enrollment, Assignment, Profile
from django.contrib.auth import authenticate, login

def home(request):
    return render(request, "home.html")

def all_users(request):
    users = User.objects.all()
    return render(request, "users_list.html", {"users": users})

#------------------- Register ------------------
from django.contrib.auth.models import User, Group
def register(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        role = request.POST['role']

        # ✅ CHECK if username exists
        if User.objects.filter(username=username).exists():
            return render(request, "register.html", {
                "error": "Username already exists"
            })

        # create user
        user = User.objects.create_user(username=username, password=password)

        # create/get group
        group, created = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        return redirect('/login/')

    return render(request, "register.html")

#------------------- Login ------------------
def login_view(request):   # FUNCTION START

    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = User.objects.filter(username=username).first()

        if user and user.check_password(password):
            request.session['user'] = username

            if user.groups.exists():
                role = user.groups.first().name
            else:
                role = "student"

            request.session['role'] = role

            return redirect('/dashboard/')   # ✅ inside function

    return render(request, "login.html")     # ✅ inside function
#------------------- Forgot Password ------------------
def forgot(request):
    if request.method == "POST":
        username = request.POST['username']

        try:
            user = User.objects.get(username=username)

            otp = str(random.randint(100000, 999999))
            request.session['otp'] = otp
            request.session['reset_user'] = username

            print("OTP:", otp)   # check terminal

            return redirect('/verify-otp/')
        except:
            return render(request, "forgot.html", {"error": "User not found"})

    return render(request, "forgot.html")

#------------------- Verify OTP ------------------
def verify_otp(request):
    if request.method == "POST":
        entered = request.POST['otp']

        if entered == request.session.get('otp'):
            return redirect('/reset-password/')
        else:
            return render(request, "verify_otp.html", {"error": "Invalid OTP"})

    return render(request, "verify_otp.html")

#------------------- Reset Password ------------------
def reset_password(request):
    if request.method == "POST":
        new_pass = make_password(request.POST['password'])
        username = request.session.get('reset_user')

        user = User.objects.get(username=username)
        user.password = new_pass
        user.save()

        return redirect('/login/')

    return render(request, "reset_password.html")

#------------------- Dashboard ------------------
# def dashboard(request):
#     if 'user' in request.session:
#         return render(request, "dashboard.html", {
#             "user": request.session['user'],
#             "role": request.session['role']
#         })
#     return redirect('/login/')
#------------------- Logout ------------------
def logout_view(request):
    request.session.flush()
    return redirect('/login/')
#------------------- Role Based Dashboard ------------------
from django.shortcuts import render, redirect
from .models import Course, Enrollment   # ADD Enrollment

def dashboard(request):
    if 'user' in request.session:
        user = request.session.get('user')
        role = request.session.get('role')

        # role-based flags
        is_student = role == "student"
        is_trainer = role == "trainer"
        is_teacher = role == "teacher"

        courses = Course.objects.all()

        # ADD THIS BLOCK
        enrolled_courses = []
        if role == "student":
            enrollments = Enrollment.objects.filter(username=user)
            enrolled_courses = [e.course for e in enrollments]

        return render(request, "dashboard.html", {
            "user": user,
            "role": role,
            "is_student": is_student,
            "is_trainer": is_trainer,
            "is_teacher": is_teacher,
            "courses": courses,
            "enrolled_courses": enrolled_courses   # ADD THIS
        })

    return redirect('/login/')

#------------------- Course List(trainer only) ------------------
def add_course(request):
    if 'user' in request.session and request.session.get('role') == "trainer":
        
        if request.method == "POST":
            title = request.POST['title']
            description = request.POST['description']
            trainer = request.session['user']

            Course.objects.create(
                title=title,
                description=description,
                created_by=trainer
            )

            return redirect('/dashboard/')

        return render(request, "add_course.html")

    return redirect('/login/')
#------------------- Course Detail ------------------
from .models import CourseContent   # ADD THIS

def course_detail(request, id):
    course = Course.objects.get(id=id)

    role = None
    is_enrolled = False
    contents = CourseContent.objects.filter(course=course)   # ADD THIS

    if 'user' in request.session:
        username = request.session['user']
        role = request.session.get('role')

        is_enrolled = Enrollment.objects.filter(
            username=username, course=course
        ).exists()

    return render(request, "course_detail.html", {
        "course": course,
        "role": role,
        "is_enrolled": is_enrolled,
        "contents": contents   # ADD THIS
    })
#------------------- Course enroll view ------------------
from .models import Enrollment

def enroll(request, id):
    if 'user' in request.session:
        username = request.session['user']
        course = Course.objects.get(id=id)

        # prevent duplicate enroll
        if not Enrollment.objects.filter(username=username, course=course).exists():
            Enrollment.objects.create(username=username, course=course)

        return redirect('/dashboard/')

    return redirect('/login/')
#------------------- ristrict enrollment-------------------
def enroll(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        # only students allowed
        if role != "student":
            return redirect('/dashboard/')

        username = request.session['user']
        course = Course.objects.get(id=id)

        if not Enrollment.objects.filter(username=username, course=course).exists():
            Enrollment.objects.create(username=username, course=course)

        return redirect('/dashboard/')

    return redirect('/login/')

#------------------- create upload view-------------------
from .models import CourseContent

def upload_content(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "trainer":
            return redirect('/dashboard/')

        course = Course.objects.get(id=id)

        if request.method == "POST":
            title = request.POST['title']
            file = request.FILES['file']
            trainer = request.session['user']

            CourseContent.objects.create(
                course=course,
                title=title,
                file=file,
                uploaded_by=trainer
            )

            return redirect(f'/course/{id}/')

        return render(request, "upload_content.html", {"course": course})

    return redirect('/login/')

#------------------- save progress -------------------
from django.http import JsonResponse
from .models import Course, Enrollment, CourseContent, Progress

def save_progress(request):
    if request.method == "POST":
        username = request.session.get('user')
        content_id = request.POST.get('content_id')
        time = request.POST.get('time')

        content = CourseContent.objects.get(id=content_id)

        obj, created = Progress.objects.get_or_create(
            username=username, content=content
        )
        obj.time_watched = int(time)
        obj.save()

        return JsonResponse({"status": "saved"})

#------------------- mark as completed -------------------
def mark_complete(request, id):
    if 'user' in request.session:

        username = request.session['user']

        # get course
        course = Course.objects.get(id=id)

        # get all videos/files in this course
        contents = CourseContent.objects.filter(course=course)

        # loop through each content
        for content in contents:

            Progress.objects.get_or_create()
            obj, created = Progress.objects.get_or_create(
                username=username,
                content=content
            )

            # mark as completed
            obj.completed = True
            obj.save()
            

        return redirect('/dashboard/')

    return redirect('/login/')

#----------------DELETE CONTENT ----------------
def delete_content(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        # only trainer allowed
        if role != "trainer":
            return redirect('/dashboard/')

        content = CourseContent.objects.get(id=id)

        course_id = content.course.id

        content.delete()

        return redirect(f'/course/{course_id}/')

    return redirect('/login/')

#------------------- Edit Content ------------------
def edit_content(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "trainer":
            return redirect('/dashboard/')

        content = CourseContent.objects.get(id=id)

        if request.method == "POST":
            content.title = request.POST['title']

            # optional file update
            if request.FILES.get('file'):
                content.file = request.FILES['file']

            content.save()

            return redirect(f'/course/{content.course.id}/')

        return render(request, "edit_content.html", {"content": content})

    return redirect('/login/')

#---------------------view to show students--------------------
from .models import Enrollment, Course

def view_students(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "trainer":
            return redirect('/dashboard/')

        course = Course.objects.get(id=id)

        enrollments = Enrollment.objects.filter(course=course)

        return render(request, "view_students.html", {
            "course": course,
            "enrollments": enrollments
        })

    return redirect('/login/')
#---------------------student assignment submission--------------------
from .models import Assignment
def upload_assignment(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "student":
            return redirect('/dashboard/')

        course = Course.objects.get(id=id)

        if request.method == "POST":
            file = request.FILES['file']
            student = request.session['user']

            Assignment.objects.create(
                course=course,
                student=student,
                file=file
            )

            return redirect(f'/course/{id}/')

        return redirect(f'/course/{id}/')

    return redirect('/login/')

#_--------------------- view assignments--------------------
def view_assignments(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "teacher":
            return redirect('/dashboard/')

        course = Course.objects.get(id=id)

        # check filter from URL
        filter_type = request.GET.get("filter")

        if filter_type == "pending":
            assignments = Assignment.objects.filter(course=course, reviewed=False)
        else:
            assignments = Assignment.objects.filter(course=course)

        return render(request, "view_assignments.html", {
            "course": course,
            "assignments": assignments
        })

    return redirect('/login/')
#---------------------mark_reviewed--------------------
def mark_reviewed(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "teacher":
            return redirect('/dashboard/')

        assignment = Assignment.objects.get(id=id)
        assignment.status = "reviewed"
        assignment.save()

        return redirect('/pending-assignments/')

    return redirect('/login/')

#---------------------review count---------------------
from django.shortcuts import render, redirect
from .models import Course, Enrollment, Assignment

def dashboard(request):
    if 'user' in request.session:
        user = request.session.get('user')
        role = request.session.get('role')

        is_student = role == "student"
        is_trainer = role == "trainer"
        is_teacher = role == "teacher"

        courses = []
        enrolled_courses = []
        available_courses = []   # IMPORTANT

        total_assignments = 0
        pending_assignments = 0

        # STUDENT LOGIC
        if role == "student":
            enrollments = Enrollment.objects.filter(username=user)
            enrolled_courses = [e.course for e in enrollments]

            all_courses = list(Course.objects.all())

            for c in all_courses:
                if c not in enrolled_courses:
                    available_courses.append(c)

        # TEACHER LOGIC
        if role == "teacher":
            courses = Course.objects.all()
            assignments = Assignment.objects.all()
            total_assignments = assignments.count()
            pending_assignments = assignments.filter(status="pending").count()

        # TRAINER LOGIC
        if role == "trainer":
            courses = Course.objects.filter(created_by=user)

        return render(request, "dashboard.html", {
            "user": user,
            "role": role,
            "is_student": is_student,
            "is_trainer": is_trainer,
            "is_teacher": is_teacher,

            "courses": courses,
            "enrolled_courses": enrolled_courses,
            "available_courses": available_courses,   # IMPORTANT FIX

            "total_assignments": total_assignments,
            "pending_assignments": pending_assignments
        })

    return redirect('/login/')

#---------------------student assignment submissions---------------------
from .models import Assignment

def my_submissions(request):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "student":
            return redirect('/dashboard/')

        username = request.session['user']

        submissions = Assignment.objects.filter(student=username)

        return render(request, "my_submissions.html", {
            "submissions": submissions
        })

    return redirect('/login/')

#---------------------global pending view---------------------
def pending_assignments(request):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "teacher":
            return redirect('/dashboard/')

        assignments = Assignment.objects.filter(status="pending")
        return render(request, "pending_assignments.html", {
            "assignments": assignments
        })

    return redirect('/login/')
#---------------------reject view---------------------
def reject_assignment(request, id):
    if 'user' in request.session:
        role = request.session.get('role')

        if role != "teacher":
            return redirect('/dashboard/')

        assignment = Assignment.objects.get(id=id)
        assignment.status = "rejected"
        assignment.save()

        return redirect('/pending-assignments/')

    return redirect('/login/')
def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)

            role = user.groups.first().name if user.groups.exists() else "student"

            request.session['user'] = username
            request.session['role'] = role

            return redirect('/dashboard/')

        return render(request, "login.html", {"error": "Invalid credentials"})

    return render(request, "login.html")
#---------------------delete course---------------------
def delete_course(request, id):
    if 'user' not in request.session:
        return redirect('/login/')

    if request.session.get('role') != "trainer":
        return redirect('/dashboard/')

    course = Course.objects.get(id=id)

    # allow only creator
    if course.created_by != request.session['user']:
        return redirect('/dashboard/')

    course.delete()
    return redirect('/dashboard/')   