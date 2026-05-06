from django.contrib import admin
from .models import Profile, Role, Course, CourseVideo, CourseAssignment


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "disabled", "created_at")
    search_fields = ("user__email", "user__username", "full_name")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("user__email", "user__username")


class CourseVideoInline(admin.TabularInline):
    model = CourseVideo
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "created_at")
    search_fields = ("title", "description")
    inlines = [CourseVideoInline]


@admin.register(CourseAssignment)
class CourseAssignmentAdmin(admin.ModelAdmin):
    list_display = ("course", "student", "assigned_at")
    search_fields = ("course__title", "student__email")
