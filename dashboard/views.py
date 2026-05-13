from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def student_dashboard(request):
    return render(request, 'dashboard/student.html', {'user': request.user})

@login_required
def trainer_dashboard(request):
    return render(request, 'dashboard/trainer.html', {'user': request.user})