from django.shortcuts import render , redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.sessions.models import Session
from django.utils import timezone
from .models import  User 
# Create your views here.
from django.contrib.sessions.models import Session



from django.contrib.sessions.models import Session

def home_view(request):
    return render(request , 'home.html')

def login_view(request):
    if request.method == 'POST':
        # username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']
        user = authenticate(request, email=email, password=password , backend='accounts.backends.EmailBackend')

        if user:

           
            if user.active_session_key:
                Session.objects.filter(
                    session_key=user.active_session_key
                ).delete()

            login(request, user)

            request.session.save()

            user.active_session_key = request.session.session_key
            user.save()

            return redirect('dashboard')
        

        else:
            return render(request , 'login.html' , {'error':'Invalid email or password'})

    return render(request, 'login.html')

def logout_view(request):
    if request.user.is_authenticated:
        request.user.active_session_key = None
        request.user.save()

    logout(request)
    return redirect('login')


def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        role = request.POST['role']

        if User.objects.filter(email=email).exists():
            return render(request,'register.html',{'error':'Email already registered'})
        
        if User.objects.filter(username=username).exists():
            return render(request,'register.html' , {'error':'Username already taken'})

        user = User.objects.create_user(
            username=username,
            email = email,
            password=password,
            role=role
        )

        login(request , user , backend='accounts.backends.EmailBackend')

        return redirect('dashboard')

    return render(request, 'register.html')