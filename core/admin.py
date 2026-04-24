from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Course, Lesson, Enrollment, LessonProgress, Quiz, Question, QuizAttempt


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('LMS Profile', {'fields': ('role', 'bio', 'avatar_color')}),
    )


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'level', 'category', 'is_published', 'created_at']
    list_filter = ['level', 'category', 'is_published']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'duration_minutes']
    list_filter = ['course']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'completed']
    list_filter = ['completed', 'course']


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'pass_score', 'question_count']
    inlines = [QuestionInline]


admin.site.register(LessonProgress)
admin.site.register(QuizAttempt)


from .models import EmailOTP
@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'created_at', 'expires_at', 'is_used', 'attempts']
    list_filter = ['is_used']

admin.site.site_header = "Coursify LMS Admin"
admin.site.site_title = "Coursify LMS"
admin.site.index_title = "Learning Management System"
