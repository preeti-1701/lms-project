from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Course

# Create your views here.
@login_required
def course_list(request):
    if request.user.role == 'student':
        courses = request.user.enrolled_courses.all()
    else:
        courses = Course.objects.all()
    return render(request, 'courses/course_list.html', {'courses': courses})