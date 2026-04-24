from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Course, Lesson, Enrollment


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'date_joined']
    search_fields = ['username', 'email']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['course_id', 'title', 'trainer', 'status', 'version', 'duration', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['course_id', 'title', 'version']
    readonly_fields = ['course_id', 'created_at', 'updated_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'course__title']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at']
    list_filter = ['enrolled_at']
    search_fields = ['student__username', 'course__title']

