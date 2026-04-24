from django.contrib import admin
from .models import Course, Video, Enrollment

class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by')
    
admin.site.register(Course)
admin.site.register(Video)
admin.site.register(Enrollment)