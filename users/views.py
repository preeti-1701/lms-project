# users/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.auth.decorators import login_required

from .forms import CustomUserCreationForm, CustomAuthenticationForm


def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user.role == 'student':
                messages.success(request, "Registration successful! Please login.")
            else:
                messages.info(
                    request,
                    "Registration submitted. An existing admin must approve this account before you can login.",
                )
            return redirect('login')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'users/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.email}!")

            # Role-based redirect (Fixed with proper namespace)
            if user.role == 'admin':
                return redirect('/admin/')
            elif user.role == 'trainer':
                return redirect('dashboard:trainer_dashboard')
            else:
                return redirect('dashboard:student_dashboard')
    else:
        form = CustomAuthenticationForm()

    return render(request, 'users/login.html', {'form': form})


@login_required
def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('login')
