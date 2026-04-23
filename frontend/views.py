from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

# All views simply render the template.
# Authentication & authorization is handled client-side via JWT tokens
# stored in localStorage. The JS in each template checks for a valid token
# and redirects to /login/ if not present.

def login_view(request):
    return render(request, 'login.html')

def admin_dashboard(request):
    return render(request, 'dashboard/admin.html')

def trainer_dashboard(request):
    return render(request, 'dashboard/trainer.html')

def student_dashboard(request):
    return render(request, 'dashboard/student.html')

def course_list(request):
    return render(request, 'courses/list.html')

def course_new(request):
    return render(request, 'courses/new.html')

def course_detail(request, course_id):
    return render(request, 'courses/detail.html')

def video_player(request, course_id, video_id):
    return render(request, 'courses/video_player.html')

def user_list(request):
    return render(request, 'users/list.html')

def enrollment_list(request):
    return render(request, 'enrollments/list.html')

def security_logs(request):
    return render(request, 'security/logs.html')

def logout_view(request):
    from django.contrib.auth import logout
    logout(request)
    return redirect('/login/')
