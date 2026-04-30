from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required
def home(request):
    if request.user.role == 'admin':
        return render(request, 'dashboard/admin_dashboard.html')
    elif request.user.role == 'trainer':
        return render(request, 'dashboard/trainer_dashboard.html')
    return render(request, 'dashboard/student_dashboard.html')