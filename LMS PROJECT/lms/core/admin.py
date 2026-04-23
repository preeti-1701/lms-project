from django.contrib import admin
from .models import Course, Video, Profile, Enrollment

admin.site.register(Course)
admin.site.register(Video)
admin.site.register(Profile)
admin.site.register(Enrollment)