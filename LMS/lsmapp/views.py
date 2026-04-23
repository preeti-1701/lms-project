from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import User
import uuid
from django.contrib.auth import login
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from django.utils import timezone
import random
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import OTP
 
# Home Page
def home(request):
    return render(request, 'home.html')

def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email'] 
        password = request.POST['password']
        role = request.POST['role']

        #  creating users
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # assigning roles 
        user.role = role
        user.save()

        login(request, user)
        return redirect('dashboard')

    return render(request, 'signup.html')


# Login function
def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
       #creating session for user
        user = authenticate(request, username=username, password=password)

        if user is not None:

            # checking if user is active
            if not user.is_active:
                return render(request, 'login.html', {'error': 'User disabled'})

            # session exists
            if not request.session.session_key:
                request.session.create()

            #  single session logic
            session_id = str(uuid.uuid4())

            user.active_session = session_id
            user.save()

            request.session['session_id'] = session_id

            login(request, user)
            return redirect('dashboard')

        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})

    return render(request, 'login.html')
# Logout
def user_logout(request):
    logout(request)
    return redirect('home')


# Dashboard
@login_required
def dashboard(request):
    if request.session.get('session_id') != request.user.active_session:
        logout(request)
        return redirect('login')
    if request.user.role == 'student':
        return render(request, 'student_dashboard.html')

    elif request.user.role == 'trainer':
        return render(request, 'trainer_dashboard.html')

    else:
        return render(request, 'admin_dashboard.html')
    

@login_required
def profile(request):
    return render(request, 'profile.html')

@login_required
def view_sessions(request):
    sessions = Session.objects.filter(expire_date__gte=timezone.now())

    session_data = []

    for session in sessions:
        data = session.get_decoded()
        user_id = data.get('_auth_user_id')

        session_data.append({
            'session_key': session.session_key,
            'user_id': user_id
        })

    return render(request, 'sessions.html', {'sessions': session_data})
def force_logout(request, session_key):
    Session.objects.filter(session_key=session_key).delete()
    return redirect('sessions')




User = get_user_model()


#  function for send OTP
def forgot_password(request):
    if request.method == "POST":
        email = request.POST.get('email')

        try:
            user = User.objects.get(email=email)

            otp = str(random.randint(100000, 999999))

            OTP.objects.create(user=user, otp=otp)

            print("OTP:", otp)  # shows in terminal

            request.session['reset_user'] = user.id

            return redirect('verify_otp')

        except User.DoesNotExist:
            return render(request, 'forgot_password.html', {'error': 'Email not found'})

    return render(request, 'forgot_password.html')


# function for verify OTP
def verify_otp(request):
    if request.method == "POST":
        entered_otp = request.POST.get('otp')
        user_id = request.session.get('reset_user')

        otp_obj = OTP.objects.filter(user_id=user_id).last()

        if otp_obj and otp_obj.otp == entered_otp:
            return redirect('reset_password')

        return render(request, 'verify_otp.html', {'error': 'Invalid OTP'})

    return render(request, 'verify_otp.html')


#  function for  reset pass
def reset_password(request):
    if request.method == "POST":
        password = request.POST.get('password')
        user_id = request.session.get('reset_user')

        user = User.objects.get(id=user_id)
        user.password = make_password(password)
        user.save()

        return redirect('/login/')

    return render(request, 'reset_password.html')