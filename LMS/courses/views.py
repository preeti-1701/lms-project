from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
import random
from django.shortcuts import get_object_or_404
from .models import Course, Video, Enrollment, Progress, Question
from lsmapp.models import User
from django.urls import reverse
from .models import Quiz
from .models import Course, Enrollment

@login_required
def create_course(request):
    if request.method == 'POST':
        Course.objects.create(
            title=request.POST['title'],
            description=request.POST['description'],
            trainer=request.user
        )
        return redirect('dashboard')

    return render(request, 'create_course.html')


@login_required
def add_video(request):
    if request.method == 'POST':
        course = get_object_or_404(Course, id=request.POST.get('course'))
        link = request.POST['link']
        if "watch?v=" in link:
            video_id = link.split("watch?v=")[-1]
            link = f"https://www.youtube.com/embed/{video_id}"
        Video.objects.create(
          title=request.POST['title'],
          youtube_link=link,
          #  youtube_link=request.POST['link'],
          course=course   # passing course obj instead of Id
)

        return redirect('dashboard')

    courses = Course.objects.filter(trainer=request.user)
    return render(request, 'add_video.html', {'courses': courses})


@login_required
def manage_students(request):
    if request.method == 'POST':
        Enrollment.objects.create(
            student_id=request.POST['student'],
            course_id=request.POST['course']
        )
        return redirect('dashboard')

    students = User.objects.filter(role='student')
    courses = Course.objects.filter(trainer=request.user)

    return render(request, 'manage_students.html', {
        'students': students,
        'courses': courses
    })


@login_required
def student_courses(request):
    enrollments = Enrollment.objects.filter(student=request.user)
    return render(request, 'student_courses.html', {'enrollments': enrollments})


@login_required
def course_videos(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    videos = Video.objects.filter(course=course)

    total = videos.count()
    completed = Progress.objects.filter(
        student=request.user,
        video__in=videos,
        completed=True
    ).count()

    progress = int((completed / total) * 100) if total > 0 else 0

    return render(request, 'course_videos.html', {
        'course': course,
        'videos': videos,
        'progress': progress
    })


@login_required
def profile(request):
    return render(request, 'profile.html')


@login_required
def mark_complete(request, video_id):
    #video = Video.objects.get(id=video_id)
    video = get_object_or_404(Video, id=video_id)
    Progress.objects.get_or_create(
        student=request.user,
        video=video,
        defaults={'completed': True}
    )

    return redirect('course_videos', course_id=video.course.id)


# take quizz function for trainer for assign quizz for student accoording to respective courses
'''@login_required
def take_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    questions = Question.objects.filter(quiz=quiz)

    return render(request, 'take_quiz.html', {
        'quiz': quiz,
        'questions': questions
    })
'''
@login_required
def take_quiz(request, quiz_id):
    quiz = Quiz.objects.get(id=quiz_id)
    questions = Question.objects.filter(quiz=quiz)

    print("METHOD:", request.method)   

    if request.method == "POST":
        score = 0
        total = questions.count()

        for q in questions:
            selected = request.POST.get(f'q{q.id}')
            print("Selected:", selected)   

            if selected:
                if int(selected) == q.correct_option:
                    score += 1

        print("Score:", score)   

        return render(request, 'quiz_result.html', {
            'score': score,
            'total': total
        })

    return render(request, 'take_quiz.html', {
        'quiz': quiz,
        'questions': questions
    })

# function for trainer creating quizz
@login_required
def create_quiz(request):
    courses = Course.objects.filter(trainer=request.user)

    if request.method == "POST":
        course_id = request.POST.get('course')
        duration = request.POST.get('duration')

        quiz = Quiz.objects.create(
            course_id=course_id,
            duration=duration
        )
        return redirect(f'/courses/question-count/?quiz_id={quiz.id}')

     
    return render(request, 'create_quiz.html', {
        'courses': courses
    })
        
#   Enter question count
@login_required
def question_count(request):
    quiz_id = request.GET.get('quiz_id')

    if request.method == "POST":
        count = request.POST.get('count')
        return redirect(f'/courses/add-question/?count={count}&quiz_id={quiz_id}')

    return render(request, 'question_count.html')


# Adding multiple questions for quizz
@login_required
def add_question(request):
    quiz_id = request.GET.get('quiz_id')   #GET QUIZ ID
    count = int(request.GET.get('count', 1))

    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if request.method == "POST":
        for i in range(count):
            Question.objects.create(
                #quiz_id=quiz_id,
                quiz=quiz,    
                text=request.POST.get(f'question_{i}'),
                option1=request.POST.get(f'option1_{i}'),
                option2=request.POST.get(f'option2_{i}'),
                option3=request.POST.get(f'option3_{i}'),
                option4=request.POST.get(f'option4_{i}'),
                correct_option=request.POST.get(f'correct_{i}')
            )

        return redirect('dashboard')

    return render(request, 'add_multiple_questions.html', {
        'count': range(count)
    })



# function for Show all courses to students
@login_required
def all_courses(request):
    courses = Course.objects.all()
    return render(request, 'all_courses.html', {'courses': courses})


# function for  Enroll in course
@login_required
def enroll_course(request, course_id):
    Enrollment.objects.get_or_create(
        student=request.user,
        course_id=course_id
    )
    return redirect('student_courses')

from .models import Enrollment, Quiz

@login_required
def quiz_courses(request):
    enrollments = Enrollment.objects.filter(student=request.user)

    return render(request, 'quiz_courses.html', {
        'enrollments': enrollments
    })

@login_required
def start_quiz(request, course_id):
    course = Course.objects.get(id=course_id)

    quiz = Quiz.objects.filter(course=course).first()

    if not quiz:
        return render(request, 'no_quiz.html')

    questions = Question.objects.filter(quiz=quiz)

    return render(request, 'take_quiz.html', {
        'quiz': quiz,
        'questions': questions
    })