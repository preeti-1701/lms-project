from django.contrib import admin

# Register your models here.
from .models import Course, Video, Enrollment

admin.site.register(Course)
admin.site.register(Video)
admin.site.register(Enrollment)