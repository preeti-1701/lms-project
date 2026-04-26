from django.contrib import admin
from .models import Course, Enrollment   

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'trainer')   


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')
    list_filter = ('course',)

admin.site.register(Course, CourseAdmin)
admin.site.register(Enrollment, EnrollmentAdmin)  
