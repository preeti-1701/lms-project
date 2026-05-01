from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from .models import CustomUser
from django.contrib.sessions.models import Session

# Create your views here.
def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)

            current_session = request.session.session_key
            if user.current_session_key:
                Session.objects.filter(session_key=user.current_session_key).delete()
            user.current_session_key = current_session
            user.save()

            return redirect("home")
        
        return render(request, "users/login.html", {"error": "Invalid username or password"})
    return render(request, 'users/login.html')

def register_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        mobile = request.POST.get("mobile")
        password = request.POST.get("password")

        if CustomUser.objects.filter(username=username).exists():
            return render(request, "users/register.html", {"error": "Username already exists"})

        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            mobile=mobile,
            password=password
        )

        login(request, user)
        current_session = request.session.session_key
        if user.current_session_key:
            Session.objects.filter(session_key=user.current_session_key).delete()
        user.current_session_key = current_session
        user.save()
        return redirect("home")
    return render(request, 'users/register.html')

def logout_view(request):
    logout(request)
    return redirect("login")