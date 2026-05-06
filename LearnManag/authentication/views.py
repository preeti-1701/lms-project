from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
import json

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        email = data.get('email')
        password = data.get('password')

        User = get_user_model()
        user_check = User.objects.filter(email=email).first()
        if user_check and user_check.check_password(password) and not user_check.is_active:
            return JsonResponse({'error': 'Your account is pending admin approval.'}, status=403)

        user = authenticate(request, email=email, password=password)

        if user is not None:

            # 🔥 O(1) SINGLE SESSION LOGIC
            # Instantly delete the old session if it exists
            if getattr(user, 'active_session_key', None):
                Session.objects.filter(session_key=user.active_session_key).delete()

            # Login user
            login(request, user)
            
            # Save the new session key for next time
            user.active_session_key = request.session.session_key
            
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            user.last_ip = ip
            user.last_device = request.META.get('HTTP_USER_AGENT', '')[:255]
            
            user.save(update_fields=['active_session_key', 'last_ip', 'last_device'])

            return JsonResponse({
                'message': 'Login successful',
                'role': user.role
            })

        return JsonResponse({'error': 'Invalid credentials'}, status=401)


@csrf_exempt
def logout_view(request):
    if request.user.is_authenticated:
        request.user.active_session_key = None
        request.user.save(update_fields=['active_session_key'])
    logout(request)
    return JsonResponse({'message': 'Logged out'})

@login_required(login_url='/login/')
def dashboard_view(request):
    return render(request, 'dashboard.html')

def login_page(request):
    if request.user.is_authenticated:
        from django.shortcuts import redirect
        return redirect('/dashboard/')
    return render(request, 'login.html')

def get_students(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required'}, status=401)
    
    if request.user.role not in ['admin', 'trainer']:
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    from django.contrib.auth import get_user_model
    User = get_user_model()
    students = User.objects.filter(role='student')
    data = [{'id': s.id, 'name': s.name, 'email': s.email} for s in students]
    return JsonResponse({'students': data})

def get_trainers(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required'}, status=401)
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    trainers = User.objects.filter(role='trainer')
    data = [{'id': t.id, 'name': t.name, 'email': t.email} for t in trainers]
    return JsonResponse({'trainers': data})

@login_required(login_url='/login/')
def profile_page(request):
    return render(request, 'profile.html')

@login_required(login_url='/login/')
def profile_api(request):
    user = request.user
    data = {
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'date_joined': user.date_joined.strftime('%B %d, %Y')
    }
    if user.role == 'student':
        data['course_count'] = user.courses_enrolled.count()
    elif user.role == 'trainer':
        data['course_count'] = user.courses_created.count()
    else:
        data['course_count'] = 0
        
    return JsonResponse(data)

@csrf_exempt
def register_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')
        
        User = get_user_model()
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
            
        user = User.objects.create_user(email=email, name=name, password=password, role=role)
        user.is_active = False
        user.save()
        return JsonResponse({'message': 'Registration successful. Pending approval.'})
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

def register_page(request):
    if request.user.is_authenticated:
        return redirect('/dashboard/')
    return render(request, 'register.html')

@login_required(login_url='/login/')
def pending_users_api(request):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
    User = get_user_model()
    users = User.objects.filter(is_active=False)
    data = [{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role} for u in users]
    return JsonResponse({'users': data})

@csrf_exempt
@login_required(login_url='/login/')
def approve_user_api(request, user_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
    User = get_user_model()
    try:
        u = User.objects.get(id=user_id)
        u.is_active = True
        u.save()
        return JsonResponse({'message': 'User approved'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
@login_required(login_url='/login/')
def reject_user_api(request, user_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
    User = get_user_model()
    try:
        u = User.objects.get(id=user_id)
        u.delete()
        return JsonResponse({'message': 'User rejected'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@login_required(login_url='/login/')
def approvals_page(request):
    if request.user.role != 'admin':
        return redirect('/dashboard/')
    return render(request, 'approvals.html')

@login_required(login_url='/login/')
def all_users_api(request):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    User = get_user_model()
    users = User.objects.filter(is_superuser=False).exclude(id=request.user.id).order_by('-date_joined')
    data = []
    for u in users:
        is_online = False
        if u.active_session_key:
            is_online = Session.objects.filter(session_key=u.active_session_key).exists()
            if not is_online:
                u.active_session_key = None
                u.save(update_fields=['active_session_key'])
                
        data.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'role': u.role,
            'is_active': u.is_active,
            'last_ip': u.last_ip or 'Unknown',
            'last_device': u.last_device or 'Unknown',
            'has_active_session': is_online
        })
    return JsonResponse({'users': data})

@csrf_exempt
@login_required(login_url='/login/')
def toggle_status_api(request, user_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    User = get_user_model()
    try:
        u = User.objects.get(id=user_id)
        if u.is_superuser or u.id == request.user.id:
            return JsonResponse({'error': 'Cannot modify this user'}, status=400)
            
        u.is_active = not u.is_active
        if not u.is_active and u.active_session_key:
            # Also terminate session if disabling
            Session.objects.filter(session_key=u.active_session_key).delete()
            u.active_session_key = None
            
        u.save()
        status_msg = "enabled" if u.is_active else "disabled"
        return JsonResponse({'message': f'Account {status_msg}'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
@login_required(login_url='/login/')
def force_logout_api(request, user_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    User = get_user_model()
    try:
        u = User.objects.get(id=user_id)
        if u.active_session_key:
            Session.objects.filter(session_key=u.active_session_key).delete()
            u.active_session_key = None
            u.save(update_fields=['active_session_key'])
            return JsonResponse({'message': 'User forcefully logged out'})
        return JsonResponse({'error': 'User already has no active session'}, status=400)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@login_required(login_url='/login/')
def manage_users_page(request):
    if request.user.role != 'admin':
        return redirect('/dashboard/')
    return render(request, 'manage_users.html')

@csrf_exempt
@login_required(login_url='/login/')
def log_violation_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        reason = data.get('reason', 'Unknown Violation')
        
        from user.models import SecurityViolation
        SecurityViolation.objects.create(user=request.user, reason=reason)
        
        strikes = request.user.security_violations.count()
        
        if strikes >= 3:
            if request.user.active_session_key:
                Session.objects.filter(session_key=request.user.active_session_key).delete()
                request.user.active_session_key = None
                request.user.save(update_fields=['active_session_key'])
            logout(request)
            
        return JsonResponse({'strikes': strikes})
    return JsonResponse({'error': 'POST only'}, status=405)

@login_required(login_url='/login/')
def violations_api(request):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Permission denied'}, status=403)
        
    from user.models import SecurityViolation
    violations = SecurityViolation.objects.select_related('user').all()[:100]
    
    data = []
    for v in violations:
        data.append({
            'id': v.id,
            'user_id': v.user.id,
            'name': v.user.name,
            'email': v.user.email,
            'role': v.user.role,
            'reason': v.reason,
            'timestamp': v.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'total_strikes': v.user.security_violations.count(),
            'is_active': v.user.is_active
        })
    return JsonResponse({'violations': data})

