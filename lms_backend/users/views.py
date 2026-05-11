from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from user_sessions.views import create_user_session
import json

@csrf_exempt
def student_register(request):
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
        role="student",
        name=name,
        mobile=mobile
    )
    
    token = create_user_session(user, request)
    
    return JsonResponse({"message": "Student registered successfully", "token": token, "user_id": user.id})

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
