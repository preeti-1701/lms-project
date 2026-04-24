from django.contrib import admin
from .models import User, Course, Video, Enrollment, Progress


# 🔐 USER ADMIN (IMPORTANT FOR ROLES)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email')


# 📚 COURSE ADMIN
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by')
    search_fields = ('title',)


# 🎥 VIDEO ADMIN
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course')
    search_fields = ('title',)


# 🎓 ENROLLMENT ADMIN
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')


# 📊 PROGRESS ADMIN
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'video', 'completed')
    list_filter = ('completed',)


# REGISTER
admin.site.register(User, UserAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Video, VideoAdmin)
admin.site.register(Enrollment, EnrollmentAdmin)
admin.site.register(Progress, ProgressAdmin)