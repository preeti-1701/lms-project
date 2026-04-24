from django.shortcuts import render, get_object_or_404, redirect # Added redirect and get_object_or_404
from django.contrib.auth.decorators import login_required # Added this for security
from .models import Course, Lesson, LessonCompletion  # Add Lesson and LessonCompletion here

# 1. Your existing home page view
def course_list(request):
    courses = Course.objects.all()
    return render(request, 'courses/course_list.html', {'courses': courses})

# 2. ADD THIS: The page for a single course
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    lessons = course.lessons.all() 
    return render(request, 'courses/course_detail.html', {'course': course, 'lessons': lessons})

# 3. ADD THIS: The logic to enroll a student
@login_required
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    course.students.add(request.user)
    return redirect('course_detail', course_id=course.id)

@login_required
def my_courses(request):
    # This filters courses to show ONLY the ones where the user is a student
    enrolled_courses = request.user.enrolled_courses.all()
    return render(request, 'courses/my_courses.html', {'courses': enrolled_courses})

def complete_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    # This creates a completion record if it doesn't exist
    LessonCompletion.objects.get_or_create(user=request.user, lesson=lesson)
    return redirect('course_detail', course_id=lesson.course.id)


def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    lessons = course.lessons.all()
    
    completed_lessons_ids = []
    progress_percent = 0
    
    if request.user.is_authenticated:
        completed_lessons_ids = LessonCompletion.objects.filter(
            user=request.user, lesson__course=course
        ).values_list('lesson_id', flat=True)
        
        if lessons.count() > 0:
            progress_percent = (len(completed_lessons_ids) / lessons.count()) * 100

    return render(request, 'courses/course_detail.html', {
        'course': course, 
        'lessons': lessons,
        'completed_lessons_ids': completed_lessons_ids,
        'progress_percent': progress_percent  # This must be here!
    })