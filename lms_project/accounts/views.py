from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout

def user_login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)

            print("User role:", user.role)

            if user.role == 'admin':
                return redirect('admin_dashboard')
            elif user.role == 'trainer':
                return redirect('trainer_dashboard')
            elif user.role == 'student':
                return redirect('student_dashboard')

    return render(request, 'accounts/login.html')

def redirect_based_on_role(user):
    if user.role == 'admin':
        return redirect('admin_dashboard')
    elif user.role == 'trainer':
        return redirect('trainer_dashboard')
    else:
        return redirect('student_dashboard')


def user_logout(request):
    logout(request)
    return redirect('home')