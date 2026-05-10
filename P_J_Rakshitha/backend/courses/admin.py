from django.contrib import admin
from .models import Course, CourseVideo, CourseAssignment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title']


@admin.register(CourseVideo)
class CourseVideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'added_at']
    list_filter = ['course']


@admin.register(CourseAssignment)
class CourseAssignmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'assigned_by', 'assigned_at']
    list_filter = ['course']
    search_fields = ['student__email']