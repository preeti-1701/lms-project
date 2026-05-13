from django.contrib import admin
from .models import Course, Video

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'trainer', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'trainer')
    search_fields = ('title', 'description')
    actions = ['approve_courses']
    def approve_courses(self, request, queryset):
        queryset.update(is_approved=True)
    approve_courses.short_description = "Approve selected courses"

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'youtube_link')
    list_filter = ('course',)