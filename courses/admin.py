from django.contrib import admin
from .models import Profile, Course, Enrollment

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display  = ['title', 'trainer', 'status', 'duration', 'youtube_url', 'created_at']
    list_filter   = ['status']
    search_fields = ['title', 'description']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at']
