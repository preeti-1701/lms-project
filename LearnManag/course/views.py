from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.contrib.auth import get_user_model
from .models import Course
import json

def course_page(request):
    return render(request, 'course_list.html')

User = get_user_model()

@csrf_exempt
def create_course(request):
    if request.method == 'POST':

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Login required'}, status=401)

        if request.user.role not in ['admin', 'trainer']:
            return JsonResponse({'error': 'Permission denied'}, status=403)

        data = json.loads(request.body)

        title = data.get('title')
        description = data.get('description')

        if not title or not description:
            return JsonResponse({'error': 'Title and description are required'}, status=400)

        course = Course.objects.create(
            title=title,
            description=description,
            trainer=request.user
        )

        return JsonResponse({'message': 'Course created'})

    return JsonResponse({'error': 'Only POST allowed'}, status=405)


def get_courses(request):

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required'}, status=401)

    user = request.user

    if user.role == 'admin':
        courses = Course.objects.all()

    elif user.role == 'trainer':
        courses = Course.objects.filter(trainer=user)

    else:  # student
        courses = user.courses_enrolled.all()

    data = []

    for c in courses:
        data.append({
            'id': c.id,
            'title': c.title,
            'trainer': c.trainer.email
        })

    return JsonResponse({'courses': data})


@csrf_exempt
def assign_students(request):
    if request.method == 'POST':

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Login required'}, status=401)

        if request.user.role not in ['admin', 'trainer']:
            return JsonResponse({'error': 'Permission denied'}, status=403)

        data = json.loads(request.body)

        course_id = data.get('course_id')
        student_ids = data.get('student_ids')  # list

        if not course_id or not student_ids:
            return JsonResponse({'error': 'course_id and student_ids are required'}, status=400)

        try:
            course = Course.objects.get(id=course_id)

            students = User.objects.filter(id__in=student_ids, role='student')

            course.students.add(*students)

            return JsonResponse({'message': 'Students assigned'})

        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)