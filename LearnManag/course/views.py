from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from .models import Course, EnrollmentExpiry
from datetime import timedelta
from django.utils import timezone
import json

@login_required(login_url='/login/')
def course_page(request):
    return render(request, 'course_list.html')

@login_required(login_url='/login/')
def manage_course_view(request, course_id):
    if request.user.role not in ['admin', 'trainer']:
        return redirect('/dashboard/')
        
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return redirect('/dashboard/')
        
    if request.user.role == 'trainer' and course.trainer != request.user:
        return redirect('/dashboard/')
        
    return render(request, 'manage_course.html', {'course': course})

User = get_user_model()

@csrf_exempt
def create_course(request):
    if request.method == 'POST':

        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Login required'}, status=401)

        if request.user.role != 'admin':
            return JsonResponse({'error': 'Permission denied. Only admins can create courses.'}, status=403)

        data = json.loads(request.body)

        title = data.get('title')
        description = data.get('description')
        trainer_id = data.get('trainer_id')

        if not title or not description:
            return JsonResponse({'error': 'Title and description are required'}, status=400)

        trainer = request.user
        if trainer_id:
            try:
                trainer = User.objects.get(id=trainer_id, role='trainer')
            except User.DoesNotExist:
                return JsonResponse({'error': 'Invalid trainer selected'}, status=400)

        course = Course.objects.create(
            title=title,
            description=description,
            trainer=trainer
        )

        return JsonResponse({'message': 'Course created'})

    return JsonResponse({'error': 'Only POST allowed'}, status=405)


def get_courses(request):

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required'}, status=401)

    user = request.user

    if user.role == 'admin':
        courses = Course.objects.select_related('trainer').all()

    elif user.role == 'trainer':
        courses = Course.objects.select_related('trainer').filter(trainer=user)

    else:  # student
        courses = user.courses_enrolled.select_related('trainer').all()

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

        if request.user.role != 'admin':
            return JsonResponse({'error': 'Permission denied. Only admins can assign students.'}, status=403)

        data = json.loads(request.body)

        course_id = data.get('course_id')
        student_ids = data.get('student_ids')  # list
        duration_days = data.get('duration_days')

        if not course_id or not student_ids:
            return JsonResponse({'error': 'course_id and student_ids are required'}, status=400)

        try:
            course = Course.objects.get(id=course_id)
            students = User.objects.filter(id__in=student_ids, role='student')
            course.students.add(*students)
            
            expires_at = None
            if duration_days:
                expires_at = timezone.now() + timedelta(days=int(duration_days))
                
            for s in students:
                EnrollmentExpiry.objects.update_or_create(
                    course=course,
                    student=s,
                    defaults={'expires_at': expires_at}
                )

            return JsonResponse({'message': 'Students assigned'})

        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)

@login_required(login_url='/login/')
def get_enrolled_students(request, course_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    try:
        course = Course.objects.prefetch_related('students').get(id=course_id)
        students = course.students.all()
        
        expiries = EnrollmentExpiry.objects.filter(course=course, student__in=students)
        expiry_map = {e.student_id: e.expires_at for e in expiries}
        
        data = []
        for s in students:
            exp_date = expiry_map.get(s.id)
            exp_str = exp_date.strftime('%b %d, %Y') if exp_date else 'Lifetime'
            data.append({
                'id': s.id,
                'name': s.name,
                'email': s.email,
                'expires': exp_str
            })
            
        return JsonResponse({'students': data})
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)

@csrf_exempt
@login_required(login_url='/login/')
def unenroll_student(request):
    if request.method == 'POST':
        if request.user.role != 'admin':
            return JsonResponse({'error': 'Permission denied'}, status=403)
            
        data = json.loads(request.body)
        course_id = data.get('course_id')
        student_id = data.get('student_id')
        
        try:
            course = Course.objects.get(id=course_id)
            student = User.objects.get(id=student_id)
            course.students.remove(student)
            EnrollmentExpiry.objects.filter(course=course, student=student).delete()
            return JsonResponse({'message': 'Student unenrolled'})
        except (Course.DoesNotExist, User.DoesNotExist):
            return JsonResponse({'error': 'Not found'}, status=404)
    return JsonResponse({'error': 'POST only'}, status=405)