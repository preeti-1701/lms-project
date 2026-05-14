from django.contrib import admin

# Register your models here.
from .models import Course, Video, Enrollment, Progress, CourseAssignment

admin.site.register(Course)
admin.site.register(Video)
admin.site.register(Enrollment)
admin.site.register(Progress)
admin.site.register(CourseAssignment)