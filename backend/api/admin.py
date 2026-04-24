from django.contrib import admin
from .models import CustomUser, Course, Video, Enrollment, SessionLog

admin.site.register(CustomUser)
admin.site.register(Course)
admin.site.register(Video)
admin.site.register(Enrollment)
admin.site.register(SessionLog)