from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Course, Lesson, Enrollment, LessonProgress, Category, UserSession


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('LMS Info', {'fields': ('role', 'bio', 'phone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('LMS Info', {'fields': ('role',)}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'trainer', 'category', 'level', 'is_active', 'created_at']
    list_filter = ['level', 'is_active', 'category']
    search_fields = ['title', 'description']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'duration_minutes', 'youtube_id']
    list_filter = ['course']
    search_fields = ['title', 'course__title']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'is_active', 'completed']
    list_filter = ['is_active', 'completed']
    search_fields = ['student__username', 'course__title']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'lesson', 'completed', 'completed_at']


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_key', 'last_activity']
