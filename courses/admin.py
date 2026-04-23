from django.contrib import admin
from .models import Course, Video

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'category', 'created_by', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'position', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'course__title')
    ordering = ('course', 'position')
