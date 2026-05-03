from django.contrib import admin
from .models import Course, Video, UserCourse

class VideoInline(admin.TabularInline):  # This shows videos inside Course admin page
    model = Video
    extra = 1
    fields = ['title', 'youtube_url', 'order']
    ordering = ['order']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'video_count', 'created_at')
    list_filter = ('created_by',)
    search_fields = ('title',)
    inlines = [VideoInline]  # This adds the video table inside course edit page
    
    def video_count(self, obj):
        return obj.videos.count()
    video_count.short_description = 'Number of Videos'

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'created_at')
    list_filter = ('course',)
    search_fields = ('title',)

@admin.register(UserCourse)
class UserCourseAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'assigned_at')
    list_filter = ('course',)
    search_fields = ('user__email', 'course__title')