from django.contrib import admin
from .models import User, LoginSession, Course, Video, StudentEnrollment

admin.site.register(User)
admin.site.register(LoginSession)
admin.site.register(Course)
admin.site.register(Video)
admin.site.register(StudentEnrollment)
