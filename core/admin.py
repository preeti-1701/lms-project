from django.contrib import admin

from .models import Course, Enrollment, Profile, SessionActivity, Video


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "mobile")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email", "mobile")


class VideoInline(admin.TabularInline):
    model = Video
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "created_at")
    search_fields = ("title", "created_by__username")
    inlines = [VideoInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "assigned_at")
    search_fields = ("student__username", "course__title")


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "position")
    list_filter = ("course",)
    search_fields = ("title", "course__title")


@admin.register(SessionActivity)
class SessionActivityAdmin(admin.ModelAdmin):
    list_display = ("user", "ip_address", "session_key", "is_active", "logged_in_at", "logged_out_at")
    list_filter = ("is_active",)
    search_fields = ("user__username", "ip_address", "session_key")
