from django.contrib import admin
from accounts.models import User
from .models import Course, Enrollment, Lesson, LessonProgress


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'lesson_count', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at',)
    inlines = [LessonInline]

    # ✅ SHOW instructor dropdown
    fields = ('title', 'description', 'video_url', 'instructor')

    # ✅ filter only trainers (or admin)
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "instructor":
            kwargs["queryset"] = User.objects.filter(role='trainer')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')
    list_filter = ('enrolled_at',)


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'completed', 'completed_at')
    list_filter = ('completed',)