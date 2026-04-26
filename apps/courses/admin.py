"""
LMS Admin Panel — Course and Enrollment Management
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Course, Video, Enrollment, VideoProgress


class VideoInline(admin.TabularInline):
    model = Video
    extra = 1
    fields = ['order', 'title', 'youtube_url', 'duration_minutes', 'is_active']
    ordering = ['order']


class EnrollmentInline(admin.TabularInline):
    model = Enrollment
    extra = 0
    readonly_fields = ['user', 'enrolled_by', 'enrolled_at', 'progress_percent']
    fields = ['user', 'is_active', 'enrolled_by', 'enrolled_at', 'progress_percent', 'expires_at']
    can_delete = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'status_badge', 'created_by', 'video_count',
        'enrolled_count', 'created_at', 'updated_at'
    ]
    list_filter = ['status', 'created_at', 'created_by']
    search_fields = ['title', 'description', 'created_by__email']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['id', 'created_at', 'updated_at', 'video_count', 'enrolled_count']
    inlines = [VideoInline, EnrollmentInline]

    fieldsets = (
        (None, {
            'fields': ('id', 'title', 'slug', 'description', 'thumbnail')
        }),
        (_('Status & Ownership'), {
            'fields': ('status', 'created_by')
        }),
        (_('Statistics'), {
            'fields': ('video_count', 'enrolled_count', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['publish_courses', 'archive_courses', 'draft_courses']

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'draft': '#95a5a6',
            'published': '#27ae60',
            'archived': '#e74c3c',
        }
        color = colors.get(obj.status, '#95a5a6')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:3px;font-size:11px;font-weight:bold;">{}</span>',
            color, obj.get_status_display()
        )

    @admin.display(description='Videos')
    def video_count(self, obj):
        return obj.video_count

    @admin.display(description='Students')
    def enrolled_count(self, obj):
        return obj.enrolled_count

    @admin.action(description='✔ Publish selected courses')
    def publish_courses(self, request, queryset):
        updated = queryset.update(status=Course.Status.PUBLISHED)
        self.message_user(request, f'{updated} course(s) published.')

    @admin.action(description='📦 Archive selected courses')
    def archive_courses(self, request, queryset):
        updated = queryset.update(status=Course.Status.ARCHIVED)
        self.message_user(request, f'{updated} course(s) archived.')

    @admin.action(description='✏ Set selected courses to Draft')
    def draft_courses(self, request, queryset):
        updated = queryset.update(status=Course.Status.DRAFT)
        self.message_user(request, f'{updated} course(s) set to draft.')


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'course', 'order', 'duration_minutes',
        'youtube_preview', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'course', 'created_at']
    search_fields = ['title', 'course__title']
    readonly_fields = ['id', 'youtube_video_id', 'embed_url', 'thumbnail_url', 'created_at']

    @admin.display(description='YouTube Preview')
    def youtube_preview(self, obj):
        if obj.youtube_video_id:
            return format_html(
                '<img src="https://img.youtube.com/vi/{}/default.jpg" '
                'height="45" style="border-radius:3px;">',
                obj.youtube_video_id
            )
        return '—'


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'course', 'is_active', 'progress_percent',
        'enrolled_by', 'enrolled_at', 'expires_at'
    ]
    list_filter = ['is_active', 'course', 'enrolled_at']
    search_fields = ['user__email', 'user__first_name', 'course__title']
    readonly_fields = ['id', 'enrolled_at', 'enrolled_by']

    actions = ['activate_enrollments', 'deactivate_enrollments']

    @admin.display(description='Progress')
    def progress_percent(self, obj):
        return f'{obj.progress_percent}%'

    @admin.action(description='Activate selected enrollments')
    def activate_enrollments(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} enrollment(s) activated.')

    @admin.action(description='Deactivate selected enrollments')
    def deactivate_enrollments(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} enrollment(s) deactivated.')