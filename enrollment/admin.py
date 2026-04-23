from django.contrib import admin
from .models import Enrollment, LessonProgress


class LessonProgressInline(admin.TabularInline):
    model = LessonProgress
    extra = 0
    readonly_fields = ('lesson', 'watch_time_seconds', 'completed_at')
    fields = ('lesson', 'is_completed', 'watch_time_seconds', 'completed_at')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'enrolled_at', 'completed_at')
    list_filter = ('status',)
    search_fields = ('student__username', 'course__title')
    readonly_fields = ('enrolled_at',)
    inlines = [LessonProgressInline]  # see lesson progress inside enrollment


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'lesson', 'is_completed', 'watch_time_seconds')
    list_filter = ('is_completed',)
    search_fields = ('enrollment__student__username', 'lesson__title')
    