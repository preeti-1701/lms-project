from django.contrib import admin
from .models import User, Course, Video, CourseEnrollment

# Register your models here.
admin.site.register(User)
admin.site.register(Course)
admin.site.register(Video)
admin.site.register(CourseEnrollment)