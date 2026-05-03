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
from .models import Course, CourseVideo, Enrollment

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

    def post(self, request, *args, **kwargs):
        email = request.POST.get('email')
        if email and User.objects.filter(email=email, role='STUDENT').exists():
            messages.info(request, "Account already exists. Please login.")
            return redirect('login')
        return super().post(request, *args, **kwargs)

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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['students'] = User.objects.filter(role='STUDENT').order_by('-date_joined')
        context['trainers'] = User.objects.filter(role='TRAINER').order_by('-date_joined')
        context['courses'] = Course.objects.all().order_by('-created_at')
        context['enrollments'] = Enrollment.objects.all().order_by('-enrolled_at')
        
        context['total_students'] = context['students'].count()
        context['total_trainers'] = context['trainers'].count()
        context['total_courses'] = context['courses'].count()
        context['total_enrollments'] = context['enrollments'].count()
        
        return context

@method_decorator(never_cache, name='dispatch')
class AdminCourseVideosView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = "users/admin_course_videos.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
            context['course'] = course
            context['videos'] = course.videos.all().order_by('order', 'id')
        except Course.DoesNotExist:
            context['course'] = None
            context['videos'] = []
        return context

    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')
        if action == 'change_password':
            old_pass = request.POST.get('old_password')
            new_pass = request.POST.get('new_password')
            confirm_pass = request.POST.get('confirm_password')
            
            if request.user.check_password(old_pass):
                if new_pass == confirm_pass:
                    request.user.set_password(new_pass)
                    request.user.save()
                    from django.contrib.auth import update_session_auth_hash
                    update_session_auth_hash(request, request.user)
                    messages.success(request, "Password changed successfully.")
                else:
                    messages.error(request, "New passwords do not match.")
            else:
                messages.error(request, "Incorrect old password.")
        
        return redirect('admin_dashboard')

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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        trainer = self.request.user
        
        context['my_courses'] = Course.objects.filter(created_by=trainer).order_by('-created_at')
        context['my_videos'] = CourseVideo.objects.filter(course__created_by=trainer)
        context['my_enrollments'] = Enrollment.objects.filter(course__created_by=trainer).select_related('student', 'course').order_by('-enrolled_at')
        
        student_ids = context['my_enrollments'].values_list('student_id', flat=True).distinct()
        context['my_students'] = User.objects.filter(id__in=student_ids)
        
        context['total_courses'] = context['my_courses'].count()
        context['total_videos'] = context['my_videos'].count()
        context['total_students'] = context['my_students'].count()
        
        return context

    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')
        if action == 'create_course':
            title = request.POST.get('title')
            description = request.POST.get('description')
            thumbnail = request.POST.get('thumbnail')
            difficulty_level = request.POST.get('difficulty_level')
            status = request.POST.get('status')
            
            if title:
                Course.objects.create(
                    title=title,
                    description=description,
                    thumbnail=thumbnail,
                    difficulty_level=difficulty_level,
                    status=status,
                    created_by=request.user
                )
                messages.success(request, "Course created successfully!")
        elif action == 'edit_course':
            course_id = request.POST.get('course_id')
            title = request.POST.get('title')
            description = request.POST.get('description')
            thumbnail = request.POST.get('thumbnail')
            difficulty_level = request.POST.get('difficulty_level')
            status = request.POST.get('status')
            
            try:
                course = Course.objects.get(id=course_id, created_by=request.user)
                if title:
                    course.title = title
                    course.description = description
                    course.thumbnail = thumbnail
                    course.difficulty_level = difficulty_level
                    course.status = status
                    course.save()
                    messages.success(request, "Course updated successfully!")
            except Course.DoesNotExist:
                messages.error(request, "Course not found or unauthorized.")
        elif action == 'delete_video':
            pass # Removed from here, moved to ManageCourseVideosView
                
        return redirect('trainer_dashboard')

@method_decorator(never_cache, name='dispatch')
class ManageCourseVideosView(LoginRequiredMixin, TrainerRequiredMixin, TemplateView):
    template_name = "users/manage_course_videos.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id, created_by=self.request.user)
            context['course'] = course
            context['videos'] = course.videos.all()
        except Course.DoesNotExist:
            context['course'] = None
        return context

    def post(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_id')
        action = request.POST.get('action')
        
        try:
            course = Course.objects.get(id=course_id, created_by=request.user)
            
            if action == 'add_video':
                title = request.POST.get('title')
                youtube_url = request.POST.get('youtube_url')
                
                if title and youtube_url:
                    CourseVideo.objects.create(
                        course=course,
                        title=title,
                        youtube_url=youtube_url
                    )
                    messages.success(request, "Video added successfully!")
                else:
                    messages.error(request, "Title and YouTube URL are required.")
                    
            elif action == 'delete_video':
                video_id = request.POST.get('video_id')
                try:
                    video = CourseVideo.objects.get(id=video_id, course=course)
                    video.delete()
                    messages.success(request, "Video deleted successfully!")
                except CourseVideo.DoesNotExist:
                    messages.error(request, "Video not found.")
                    
        except Course.DoesNotExist:
            messages.error(request, "Invalid course or unauthorized.")
            return redirect('trainer_dashboard')
            
        return redirect('manage_course_videos', course_id=course_id)

# --- STUDENT VIEWS ---
@method_decorator(never_cache, name='dispatch')
class StudentDashboardView(LoginRequiredMixin, StudentRequiredMixin, TemplateView):
    template_name = "users/student_dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        student = self.request.user
        
        # All published courses
        context['all_courses'] = Course.objects.filter(status='PUBLISHED').order_by('-created_at')
        
        # Enrolled courses
        enrolled_ids = Enrollment.objects.filter(student=student).values_list('course_id', flat=True)
        context['enrolled_course_ids'] = list(enrolled_ids)
        context['my_courses'] = Course.objects.filter(id__in=enrolled_ids).order_by('-created_at')
        
        return context

@method_decorator(never_cache, name='dispatch')
class StudentCourseDetailView(LoginRequiredMixin, StudentRequiredMixin, TemplateView):
    template_name = "users/student_course_detail.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        course_id = self.kwargs.get('course_id')
        student = self.request.user
        
        try:
            course = Course.objects.get(id=course_id, status='PUBLISHED')
            context['course'] = course
            context['videos'] = course.videos.all()
            context['is_enrolled'] = Enrollment.objects.filter(student=student, course=course).exists()
        except Course.DoesNotExist:
            context['course'] = None
            
        return context

    def post(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_id')
        action = request.POST.get('action')
        student = request.user
        
        if action == 'enroll':
            try:
                course = Course.objects.get(id=course_id, status='PUBLISHED')
                Enrollment.objects.get_or_create(student=student, course=course)
                messages.success(request, f"Successfully enrolled in {course.title}!")
            except Course.DoesNotExist:
                messages.error(request, "Course not found or unavailable.")
                
        return redirect('student_course_detail', course_id=course_id)

def logout_view(request):
    django_logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("login")
