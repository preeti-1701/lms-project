from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from .models import Course, EnrollmentExpiry, EnrollmentRequest
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
        status = data.get('status', 'upcoming')

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
            trainer=trainer,
            status=status
        )

        return JsonResponse({'message': 'Course created'})

    return JsonResponse({'error': 'Only POST allowed'}, status=405)


def get_courses(request):

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required'}, status=401)

    user = request.user
    req_type = request.GET.get('type', 'all')
    pending_request_course_ids = set()
    enrolled_set = set()

    if user.role == 'admin':
        courses = Course.objects.select_related('trainer').all()
    elif user.role == 'trainer':
        courses = Course.objects.select_related('trainer').filter(trainer=user)
    else:  # student
        enrolled = list(user.courses_enrolled.select_related('trainer').all())
        enrolled_set = set(c.id for c in enrolled)
        
        if req_type == 'enrolled':
            courses = enrolled
        else:
            upcoming = list(Course.objects.filter(status='upcoming').exclude(id__in=enrolled_set).select_related('trainer').all())
            pending_request_course_ids = set(user.enrollment_requests.filter(status='pending').values_list('course_id', flat=True))
            courses = enrolled + upcoming

    data = []

    for c in courses:
        is_enrolled = True if user.role != 'student' else (c.id in enrolled_set)
        enrollment_status = 'none'
        
        if user.role == 'student':
            if c.id in enrolled_set:
                enrollment_status = 'approved'
            elif c.id in pending_request_course_ids:
                enrollment_status = 'pending'

        data.append({
            'id': c.id,
            'title': c.title,
            'trainer': c.trainer.email if c.trainer else 'Unknown',
            'status': c.status,
            'is_enrolled': is_enrolled,
            'enrollment_status': enrollment_status
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

@csrf_exempt
@login_required(login_url='/login/')
def request_enrollment_api(request, course_id):
    if request.method == 'POST':
        if request.user.role != 'student':
            return JsonResponse({'error': 'Only students can request enrollment'}, status=403)
            
        try:
            course = Course.objects.get(id=course_id, status='upcoming')
            if course.students.filter(id=request.user.id).exists():
                return JsonResponse({'error': 'Already enrolled'}, status=400)
                
            req, created = EnrollmentRequest.objects.get_or_create(
                course=course,
                student=request.user,
                defaults={'status': 'pending'}
            )
            
            if not created and req.status != 'pending':
                req.status = 'pending'
                req.save()
                
            return JsonResponse({'message': 'Enrollment requested'})
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found or not available for request'}, status=404)
    return JsonResponse({'error': 'POST only'}, status=405)

@login_required(login_url='/login/')
def get_enrollment_requests_api(request):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    requests = EnrollmentRequest.objects.filter(status='pending').select_related('course', 'student')
    data = []
    for req in requests:
        data.append({
            'id': req.id,
            'student_name': req.student.name,
            'student_email': req.student.email,
            'course_id': req.course.id,
            'course_title': req.course.title,
            'requested_at': req.requested_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return JsonResponse({'requests': data})

@csrf_exempt
@login_required(login_url='/login/')
def handle_enrollment_request_api(request, request_id):
    if request.method == 'POST':
        if request.user.role != 'admin':
            return JsonResponse({'error': 'Permission denied'}, status=403)
            
        data = json.loads(request.body)
        action = data.get('action') # 'approve' or 'reject'
        
        try:
            req = EnrollmentRequest.objects.get(id=request_id, status='pending')
            
            if action == 'approve':
                req.status = 'approved'
                req.save()
                req.course.students.add(req.student)
                # Ensure they have lifetime access by default, or admin can edit later
                EnrollmentExpiry.objects.get_or_create(course=req.course, student=req.student, defaults={'expires_at': None})
                return JsonResponse({'message': 'Enrollment approved'})
            elif action == 'reject':
                req.status = 'rejected'
                req.save()
                return JsonResponse({'message': 'Enrollment rejected'})
            else:
                return JsonResponse({'error': 'Invalid action'}, status=400)
                
        except EnrollmentRequest.DoesNotExist:
            return JsonResponse({'error': 'Request not found or already handled'}, status=404)
    return JsonResponse({'error': 'POST only'}, status=405)

@login_required(login_url='/login/')
def enrollment_requests_page(request):
    if request.user.role != 'admin':
        return redirect('/dashboard/')
    return render(request, 'enrollment_requests.html')

@csrf_exempt
@login_required(login_url='/login/')
def update_course_status_api(request, course_id):
    if request.method == 'POST':
        if request.user.role not in ['admin', 'trainer']:
            return JsonResponse({'error': 'Permission denied'}, status=403)
            
        data = json.loads(request.body)
        status = data.get('status')
        
        if status not in ['upcoming', 'ongoing', 'completed']:
            return JsonResponse({'error': 'Invalid status'}, status=400)
            
        try:
            course = Course.objects.get(id=course_id)
            if request.user.role == 'trainer' and course.trainer != request.user:
                return JsonResponse({'error': 'Permission denied'}, status=403)
                
            course.status = status
            course.save(update_fields=['status'])
            return JsonResponse({'message': 'Course status updated'})
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)
    return JsonResponse({'error': 'POST only'}, status=405)