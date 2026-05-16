from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Course, Video, Enrollment
from django.contrib.auth.decorators import login_required
import json

@csrf_exempt
def course_list(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    courses = Course.objects.all()
    course_data = []
    
    # Get user from authorization header if available
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = None
    if token:
        from user_sessions.models import UserSession
        session = UserSession.objects.filter(token=token).first()
        if session:
            user = session.user
    
    for course in courses:
        enrollment_status = "not_enrolled"
        if user:
            enrollment = Enrollment.objects.filter(student=user, course=course).first()
            if enrollment:
                enrollment_status = enrollment.status
        
        course_data.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "image_url": course.image_url,
            "enrollment_status": enrollment_status
        })
    
    return JsonResponse({"courses": course_data})

@csrf_exempt
def course_detail(request, course_id):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        course = Course.objects.get(id=course_id)
        videos = Video.objects.filter(course=course)
        video_data = []
        for video in videos:
            video_data.append({
                "id": video.id,
                "title": video.title,
                "youtube_url": video.youtube_url
            })
        
        return JsonResponse({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "image_url": course.image_url,
            "status": course.status,
            "chapter_count": videos.count(),
            "chapters": video_data
        })
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)

@csrf_exempt
def add_chapter(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        data = json.loads(request.body)
        course_id = data.get("course_id")
        title = data.get("title")
        youtube_url = data.get("youtube_url")
        
        if not course_id or not title or not youtube_url:
            return JsonResponse({"error": "course_id, title, and youtube_url required"}, status=400)
        
        course = Course.objects.get(id=course_id)
        
        video = Video.objects.create(
            course=course,
            title=title,
            youtube_url=youtube_url
        )
        
        return JsonResponse({"message": "Chapter added successfully", "video_id": video.id})
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_create_course(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        from user_sessions.models import UserSession
        from users.models import User
        session = UserSession.objects.filter(token=token).first()
        if not session or session.user.role != 'admin':
            return JsonResponse({"error": "Admin access required"}, status=403)
        data = json.loads(request.body)
        title = data.get("title")
        description = data.get("description")
        image_url = data.get("image_url", "")
        status = data.get("status", "ongoing")
        if not title or not description:
            return JsonResponse({"error": "title and description required"}, status=400)
        course = Course.objects.create(
            title=title,
            description=description,
            image_url=image_url,
            status=status,
            created_by=session.user
        )
        return JsonResponse({"message": "Course created successfully", "course_id": course.id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_update_course(request, course_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        data = json.loads(request.body)
        course = Course.objects.get(id=course_id)
        course.title = data.get("title", course.title)
        course.description = data.get("description", course.description)
        course.image_url = data.get("image_url", course.image_url)
        course.status = data.get("status", course.status)
        course.save()
        return JsonResponse({"message": "Course updated successfully"})
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_delete_course(request, course_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        course = Course.objects.get(id=course_id)
        course.delete()
        return JsonResponse({"message": "Course deleted successfully"})
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_assign_course(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        from user_sessions.models import UserSession
        session = UserSession.objects.filter(token=token).first()
        if not session or session.user.role != 'admin':
            return JsonResponse({"error": "Admin access required"}, status=403)

        data = json.loads(request.body)
        user_id = data.get("user_id")
        course_id = data.get("course_id")
        
        if not user_id or not course_id:
            return JsonResponse({"error": "user_id and course_id required"}, status=400)
            
        from users.models import User
        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)
        
        enrollment, created = Enrollment.objects.get_or_create(
            student=user,
            course=course
        )
        enrollment.status = 'approved' 
        enrollment.save()
        
        return JsonResponse({"message": f"Course assigned to {user.email} successfully"})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def delete_chapter(request, chapter_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        video = Video.objects.get(id=chapter_id)
        video.delete()
        return JsonResponse({"message": "Chapter deleted successfully"})
    except Video.DoesNotExist:
        return JsonResponse({"error": "Chapter not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_chapter(request, chapter_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=400)
    
    try:
        data = json.loads(request.body)
        title = data.get("title")
        youtube_url = data.get("youtube_url")
        
        if not title or not youtube_url:
            return JsonResponse({"error": "title and youtube_url required"}, status=400)
        
        video = Video.objects.get(id=chapter_id)
        video.title = title
        video.youtube_url = youtube_url
        video.save()
        
        return JsonResponse({"message": "Chapter updated successfully"})
    except Video.DoesNotExist:
        return JsonResponse({"error": "Chapter not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def enroll_course(request, course_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        from users.models import User
        # Get user from authorization header
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JsonResponse({"error": "Authorization required"}, status=401)
        
        from user_sessions.models import UserSession
        session = UserSession.objects.filter(token=token).first()
        if not session:
            return JsonResponse({"error": "Invalid token"}, status=401)
        
        user = session.user
        course = Course.objects.get(id=course_id)
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course=course).exists():
            return JsonResponse({"error": "Already enrolled"}, status=400)
        
        # Create enrollment with pending status
        Enrollment.objects.create(student=user, course=course, status='pending')
        
        return JsonResponse({"message": "Enrollment request sent. Waiting for approval."})
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def my_courses(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        from users.models import User
        # Get user from authorization header
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JsonResponse({"error": "Authorization required"}, status=401)
        
        from user_sessions.models import UserSession
        session = UserSession.objects.filter(token=token).first()
        if not session:
            return JsonResponse({"error": "Invalid token"}, status=401)
        
        user = session.user
        enrollments = Enrollment.objects.filter(student=user, status='approved')
        course_data = []
        for enrollment in enrollments:
            course = enrollment.course
            videos = Video.objects.filter(course=course)
            video_data = []
            for video in videos:
                video_data.append({
                    "id": video.id,
                    "title": video.title,
                    "youtube_url": video.youtube_url
                })
            
            course_data.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "image_url": course.image_url,
                "videos": video_data
            })
        
        return JsonResponse({"courses": course_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def enrollment_requests(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        enrollments = Enrollment.objects.filter(status='pending')
        enrollment_data = []
        for enrollment in enrollments:
            enrollment_data.append({
                "id": enrollment.id,
                "student_id": enrollment.student.id,
                "student_email": enrollment.student.email,
                "student_name": enrollment.student.name,
                "course_id": enrollment.course.id,
                "course_title": enrollment.course.title,
                "status": enrollment.status
            })
        
        return JsonResponse({"enrollments": enrollment_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def approve_enrollment(request, enrollment_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        enrollment = Enrollment.objects.get(id=enrollment_id)
        enrollment.status = 'approved'
        enrollment.save()
        return JsonResponse({"message": "Enrollment approved"})
    except Enrollment.DoesNotExist:
        return JsonResponse({"error": "Enrollment not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def reject_enrollment(request, enrollment_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        enrollment = Enrollment.objects.get(id=enrollment_id)
        enrollment.status = 'rejected'
        enrollment.save()
        return JsonResponse({"message": "Enrollment rejected"})
    except Enrollment.DoesNotExist:
        return JsonResponse({"error": "Enrollment not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
