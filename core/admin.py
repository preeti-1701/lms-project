from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from rest_framework.authtoken.models import TokenProxy
from .models import (
    User, Course, Lesson, Enrollment, LessonProgress,
    Quiz, Question, QuizAttempt, EmailOTP, UserSession
)


# =====================================================================
# HIDE unwanted models from admin (auth tokens, groups)
# =====================================================================
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass
try:
    admin.site.unregister(TokenProxy)
except admin.sites.NotRegistered:
    pass


# =====================================================================
# PROXY MODELS for clean separation of Students and Teachers
# =====================================================================
class Student(User):
    class Meta:
        proxy = True
        verbose_name = "Student"
        verbose_name_plural = "Students"


class Teacher(User):
    class Meta:
        proxy = True
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"


# =====================================================================
# USER admins (separated by role)
# =====================================================================
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """All users — kept for autocomplete / fallback access."""
    list_display = ['username', 'email', 'role', 'is_verified', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('LMS Profile', {'fields': ('role', 'bio', 'avatar_color', 'is_verified')}),
    )


@admin.register(Student)
class StudentAdmin(BaseUserAdmin):
    """Students only."""
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_verified', 'is_active']
    list_filter = ['is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_verified')}),
        ('LMS Profile', {'fields': ('bio', 'avatar_color')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='student')

    def save_model(self, request, obj, form, change):
        obj.role = 'student'
        super().save_model(request, obj, form, change)


@admin.register(Teacher)
class TeacherAdmin(BaseUserAdmin):
    """Teachers (instructors) only."""
    list_display = ['username', 'email', 'first_name', 'last_name', 'course_count', 'is_active']
    list_filter = ['is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active',)}),
        ('LMS Profile', {'fields': ('bio', 'avatar_color')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='instructor')

    def course_count(self, obj):
        return obj.courses_taught.count()
    course_count.short_description = 'Courses'

    def save_model(self, request, obj, form, change):
        obj.role = 'instructor'
        obj.is_verified = True
        super().save_model(request, obj, form, change)


# =====================================================================
# COURSE / LESSON / QUIZ
# =====================================================================
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['order', 'title', 'video_url', 'duration_minutes']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'level', 'category', 'is_published', 'enrollment_count_display']
    list_filter = ['level', 'category', 'is_published']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['instructor']
    inlines = [LessonInline]

    def enrollment_count_display(self, obj):
        return obj.enrollments.count()
    enrollment_count_display.short_description = 'Students'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'has_video', 'duration_minutes']
    list_filter = ['course']
    search_fields = ['title']
    autocomplete_fields = ['course']

    def has_video(self, obj):
        return '🎬' if obj.video_url else '—'
    has_video.short_description = 'Video'


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'pass_score', 'question_count']
    inlines = [QuestionInline]
    autocomplete_fields = ['course']


# =====================================================================
# ENROLLMENT (admin assigns courses to students)
# =====================================================================
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'progress_display', 'completed']
    list_filter = ['completed', 'course']
    search_fields = ['student__username', 'student__email', 'student__first_name', 'student__last_name', 'course__title']
    autocomplete_fields = ['student', 'course']
    date_hierarchy = 'enrolled_at'

    def progress_display(self, obj):
        return f"{obj.progress_percent}%"
    progress_display.short_description = 'Progress'


# =====================================================================
# USER SESSIONS (force-logout demo - SRS 3.5)
# =====================================================================
@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_label', 'ip_address', 'last_active', 'is_active']
    list_filter = ['is_active', 'device_label']
    search_fields = ['user__username', 'user__email', 'ip_address', 'device_label']
    readonly_fields = ['user', 'token_key', 'ip_address', 'user_agent', 'device_label', 'created_at', 'last_active']
    actions = ['force_logout']
    date_hierarchy = 'last_active'

    def force_logout(self, request, queryset):
        from rest_framework.authtoken.models import Token
        count = 0
        for session in queryset.filter(is_active=True):
            Token.objects.filter(key=session.token_key).delete()
            session.is_active = False
            session.save()
            count += 1
        self.message_user(request, f'Force-logged-out {count} session(s).')
    force_logout.short_description = 'Force-logout selected sessions (SRS 3.5)'


# =====================================================================
# ADMIN BRANDING
# =====================================================================
admin.site.site_header = "Coursify LMS Admin"
admin.site.site_title = "Coursify LMS"
admin.site.index_title = "Learning Management System"

# Note: EmailOTP, LessonProgress, QuizAttempt, Question are intentionally
# NOT registered — they're internal tables managed via the app, not admin.
