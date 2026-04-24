from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Course, Video, Enrollment, VideoProgress, AuditLog


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display  = ["email", "name", "role", "status", "joined"]
    list_filter   = ["role", "status"]
    search_fields = ["email", "name", "mobile"]
    ordering      = ["-joined"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name", "mobile", "role", "status", "interests")}),
        ("Trainer Info",  {"fields": ("subject", "qualification", "experience", "bio")}),
        ("Permissions",   {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates",         {"fields": ("joined", "last_login")}),
    )
    readonly_fields = ["joined", "last_login"]

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "role", "password1", "password2"),
        }),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display  = ["title", "category", "trainer", "created_at"]
    list_filter   = ["category"]
    search_fields = ["title"]


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display  = ["title", "course", "duration", "order"]
    list_filter   = ["course"]
    search_fields = ["title"]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display  = ["student", "course", "enrolled_at"]
    search_fields = ["student__name", "course__title"]


@admin.register(VideoProgress)
class VideoProgressAdmin(admin.ModelAdmin):
    list_display  = ["student", "video", "watched", "watched_at"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ["user", "action", "timestamp", "ip_address"]
    list_filter   = ["action"]
    search_fields = ["user__name", "details"]