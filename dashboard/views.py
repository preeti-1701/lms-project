from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from users.decorators import admin_required, trainer_required
from users.models import CustomUser
from courses.models import Course

# Create your views here.
@login_required
def home(request):
    if request.user.role == 'admin':
        return render(request, 'dashboard/admin_dashboard.html', {
                "user_count": CustomUser.objects.count(),
                "course_count": Course.objects.count(),
            }
            )
    elif request.user.role == 'trainer':
        return render(request, 'dashboard/trainer_dashboard.html')
    return render(request, 'dashboard/student_dashboard.html')

@login_required
@admin_required
def admin_dashboard(request):
    return render(request, 'dashboard/admin_dashboard.html')

@login_required
@trainer_required
def trainer_dashboard(request):
    return render(request, 'dashboard/trainer_dashboard.html')