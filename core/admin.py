from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Course, Lesson, User, UserSession


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'mobile', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('LMS profile', {'fields': ('mobile', 'role')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('LMS profile', {'fields': ('email', 'mobile', 'role')}),
    )


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'trainer', 'is_published', 'updated_at')
    list_filter = ('is_published', 'trainer')
    search_fields = ('title', 'summary')
    filter_horizontal = ('students',)
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'youtube_url')


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'force_logged_out', 'last_seen')
    readonly_fields = ('session_key', 'ip_address', 'user_agent', 'last_seen')

# Register your models here.
