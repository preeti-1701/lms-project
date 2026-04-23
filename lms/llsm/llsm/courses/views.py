from django.shortcuts import render, get_object_or_404
from .models import Course

def student_courses(request):
    courses = Course.objects.filter(enrollment__student=request.user)
    return render(request, 'student_courses.html', {'courses': courses})


def course_detail(request, id):
    course = get_object_or_404(Course, id=id)
    return render(request, 'course_detail.html', {'course': course})