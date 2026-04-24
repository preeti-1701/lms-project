from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout as django_logout
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView, TemplateView, ListView, FormView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .forms import CustomUserCreationForm, CustomLoginForm, TrainerRegistrationForm
from django.contrib.auth import get_user_model
import random
import string



User = get_user_model()

from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

# --- HELPER MIXINS ---
class AdminRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.role == 'ADMIN'

class TrainerRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.role == 'TRAINER'

class StudentRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.role == 'STUDENT'

# --- AUTH VIEWS ---
class RegisterView(CreateView):
    model = User
    form_class = CustomUserCreationForm
    template_name = "users/register.html"
    success_url = reverse_lazy("login")

    def form_valid(self, form):
        messages.success(self.request, "Account created successfully! Please login.")
        return super().form_valid(form)

from django.contrib.sessions.models import Session

@method_decorator(never_cache, name='dispatch')
class CustomLoginView(LoginView):
    template_name = "users/login.html"
    authentication_form = CustomLoginForm
    redirect_authenticated_user = True
    
    def form_valid(self, form):
        user = form.get_user()
        
        # 1. Invalidate previous session if it exists
        if user.last_session_key:
            try:
                Session.objects.filter(session_key=user.last_session_key).delete()
            except Exception:
                pass # Session might already be expired or deleted
        
        # 2. Proceed with standard login
        response = super().form_valid(form)
        
        # 3. Save the new session key to the user
        user.last_session_key = self.request.session.session_key
        user.save()
        
        messages.success(self.request, f"Welcome back, {user.full_name}!")
        return response

    def get_success_url(self):
        role = self.request.user.role
        if role == 'ADMIN':
            return reverse_lazy('admin_dashboard')
        elif role == 'TRAINER':
            return reverse_lazy('trainer_dashboard')
        else:
            return reverse_lazy('student_dashboard')

# --- ADMIN VIEWS ---
@method_decorator(never_cache, name='dispatch')
class AdminDashboardView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = "users/admin_dashboard.html"

@method_decorator(never_cache, name='dispatch')
class TrainerRegistrationView(LoginRequiredMixin, AdminRequiredMixin, FormView):
    template_name = "users/trainer_register.html"
    form_class = TrainerRegistrationForm
    success_url = reverse_lazy('admin_dashboard')

    def form_valid(self, form):
        email = form.cleaned_data['email']
        full_name = form.cleaned_data['full_name']
        mobile = form.cleaned_data['mobile']
        
        # Generate simple trainer code
        trainer_code = "TRN-" + ''.join(random.choices(string.digits, k=4))
        
        # Create the user
        user = User.objects.create_user(
            email=email,
            password=trainer_code,
            full_name=full_name,
            mobile=mobile,
            role='TRAINER'
        )
        
        messages.success(self.request, f"Trainer registered! Initial Password/Code is: {trainer_code}")
        return super().form_valid(form)

@method_decorator(never_cache, name='dispatch')
class UserListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    model = User
    template_name = "users/user_list.html"
    context_object_name = 'users_list'

    def get_queryset(self):
        role_filter = self.request.GET.get('role', 'STUDENT')
        return User.objects.filter(role=role_filter).order_by('-date_joined')

# --- TRAINER VIEWS ---
@method_decorator(never_cache, name='dispatch')
class TrainerDashboardView(LoginRequiredMixin, TrainerRequiredMixin, TemplateView):
    template_name = "users/trainer_dashboard.html"

# --- STUDENT VIEWS ---
@method_decorator(never_cache, name='dispatch')
class StudentDashboardView(LoginRequiredMixin, StudentRequiredMixin, TemplateView):
    template_name = "users/student_dashboard.html"

def logout_view(request):
    django_logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("login")
