from django.contrib import admin
from .models import Course, Lesson


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['title', 'youtube_url', 'order']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['course_id', 'title', 'trainer', 'status', 'duration', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['course_id', 'title', 'description']
    readonly_fields = ['course_id', 'created_at', 'updated_at']
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'created_at']
    list_filter = ['course']
    search_fields = ['title', 'course__title']

