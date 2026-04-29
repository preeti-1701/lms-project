from django.shortcuts import render, redirect
from django.contrib.auth import login
from .models import CustomUser

# Create your views here.
def login_view(request):
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
        return redirect("home")
    return render(request, 'users/register.html')