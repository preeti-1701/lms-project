from django.contrib import admin
from .models import Course, Video, Enrollment


class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'created_by']
    list_filter = ['status', 'created_by']
    search_fields = ['title', 'description']
    fieldsets = (
        ('Course Information', {
            'fields': ('title', 'description', 'image')
        }),
        ('Settings', {
            'fields': ('status', 'created_by')
        }),
    )


admin.site.register(Course, CourseAdmin)
admin.site.register(Video)
admin.site.register(Enrollment)