from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from user_sessions.views import create_user_session
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def student_register(request):
    logger.info(f"Student registration attempt. Method: {request.method}")
    if request.method != "POST":
        logger.error("POST required")
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        logger.info(f"Registration data: {data}")
        name = data.get("name")
        email = data.get("email")
        mobile = data.get("mobile")
        password = data.get("password")
        
        if not name or not email or not password:
            logger.error("Name, email, and password required")
            return JsonResponse({"error": "Name, email, and password required"}, status=400)
        
        if User.objects.filter(email=email).exists():
            logger.error(f"Email already exists: {email}")
            return JsonResponse({"error": "Email already exists"}, status=400)
        
        user = User.objects.create_user(
            email=email,
            password=password,
            role="student",
            name=name,
            mobile=mobile
        )
        
        token = create_user_session(user, request)
        logger.info(f"Student registered successfully: {email}")
        
        return JsonResponse({"message": "Student registered successfully", "token": token, "user_id": user.id})
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return JsonResponse({"error": f"Invalid JSON format: {str(e)}"}, status=400)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def trainer_register(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    mobile = data.get("mobile")
    password = data.get("password")
    
    if not name or not email or not password:
        return JsonResponse({"error": "Name, email, and password required"}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)
    
    user = User.objects.create_user(
        email=email,
        password=password,
        role="trainer",
        name=name,
        mobile=mobile
    )
    
    token = create_user_session(user, request)
    
    return JsonResponse({"message": "Trainer registered successfully", "token": token, "user_id": user.id})

@csrf_exempt
def admin_register(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    mobile = data.get("mobile")
    password = data.get("password")
    
    if not name or not email or not password:
        return JsonResponse({"error": "Name, email, and password required"}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)
    
    user = User.objects.create_user(
        email=email,
        password=password,
        role="admin",
        name=name,
        mobile=mobile
    )
    
    token = create_user_session(user, request)
    
    return JsonResponse({"message": "Admin registered successfully", "token": token, "user_id": user.id})

@csrf_exempt
def student_login(request):
    logger.info(f"Student login attempt. Method: {request.method}")
    if request.method != "POST":
        logger.error("POST required")
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        logger.info(f"Login data: {data}")
        identifier = data.get("email") or data.get("mobile")
        password = data.get("password")
        
        if not identifier or not password:
            logger.error("Email/mobile and password required")
            return JsonResponse({"error": "Email/mobile and password required"}, status=400)
        
        # Check if identifier is email or mobile
        if '@' in identifier:
            user = User.objects.filter(email=identifier, role="student").first()
        else:
            user = User.objects.filter(mobile=identifier, role="student").first()
        
        if not user:
            logger.error(f"User not found: {identifier}")
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        if not user.check_password(password):
            logger.error(f"Invalid password for: {identifier}")
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        token = create_user_session(user, request)
        logger.info(f"Student logged in successfully: {user.email}")
        
        return JsonResponse({
            "message": "Login successful", 
            "token": token, 
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        })
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return JsonResponse({"error": f"Invalid JSON format: {str(e)}"}, status=400)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def trainer_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        data = json.loads(request.body)
        identifier = data.get("email") or data.get("mobile")
        password = data.get("password")
        
        if not identifier or not password:
            return JsonResponse({"error": "Email/mobile and password required"}, status=400)
        
        # Check if identifier is email or mobile
        if '@' in identifier:
            user = User.objects.filter(email=identifier, role="trainer").first()
        else:
            user = User.objects.filter(mobile=identifier, role="trainer").first()
        
        if not user:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        if not user.check_password(password):
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        token = create_user_session(user, request)
        
        return JsonResponse({
            "message": "Login successful", 
            "token": token, 
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        data = json.loads(request.body)
        identifier = data.get("email") or data.get("mobile")
        password = data.get("password")
        
        if not identifier or not password:
            return JsonResponse({"error": "Email/mobile and password required"}, status=400)
        
        # Check if identifier is email or mobile
        if '@' in identifier:
            user = User.objects.filter(email=identifier, role="admin").first()
        else:
            user = User.objects.filter(mobile=identifier, role="admin").first()
        
        if not user:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        if not user.check_password(password):
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        token = create_user_session(user, request)
        
        return JsonResponse({
            "message": "Login successful", 
            "token": token, 
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_stats(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        from courses.models import Course, Enrollment
        from user_sessions.models import UserSession
        
        total_students = User.objects.filter(role="student").count()
        total_trainers = User.objects.filter(role="trainer").count()
        total_courses = Course.objects.count()
        active_users = UserSession.objects.count()
        
        return JsonResponse({
            "stats": {
                "total_students": total_students,
                "total_trainers": total_trainers,
                "total_courses": total_courses,
                "active_users": active_users
            }
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_students(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        students = User.objects.filter(role="student").values('id', 'name', 'email', 'is_active', 'mobile')
        return JsonResponse({"students": list(students)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_trainers(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        trainers = User.objects.filter(role="trainer").values('id', 'name', 'email', 'is_active', 'mobile')
        return JsonResponse({"trainers": list(trainers)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_sessions(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)
    
    try:
        from user_sessions.models import UserSession
        sessions = UserSession.objects.select_related('user').values(
            'id', 'user__id', 'user__email', 'user__name', 'user__role', 'ip_address', 'device'
        )
        return JsonResponse({"sessions": list(sessions)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_force_logout(request, session_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        from user_sessions.models import UserSession
        session = UserSession.objects.get(id=session_id)
        session.delete()
        return JsonResponse({"message": "User logged out successfully"})
    except UserSession.DoesNotExist:
        return JsonResponse({"error": "Session not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
def admin_update_user(request, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        data = json.loads(request.body)
        user = User.objects.get(id=user_id)
        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        user.mobile = data.get("mobile", user.mobile)
        user.role = data.get("role", user.role)
        user.save()
        return JsonResponse({"message": "User updated successfully"})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def admin_toggle_user_status(request, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        # If disabled, also clear their sessions
        if not user.is_active:
            from user_sessions.models import UserSession
            UserSession.objects.filter(user=user).delete()
            
        return JsonResponse({"message": f"User {'enabled' if user.is_active else 'disabled'} successfully", "is_active": user.is_active})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
