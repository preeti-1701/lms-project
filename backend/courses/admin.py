from django.contrib import admin

from .models import Course, CourseItem, Enrollment


class CourseItemInline(admin.TabularInline):
    model = CourseItem
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'trainer', 'status', 'total_hours', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title', 'trainer__username', 'trainer__email')
    inlines = [CourseItemInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'student', 'enrolled_at')
    search_fields = ('course__title', 'student__username', 'student__email')
