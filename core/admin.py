from django.contrib import admin
from .models import User, Course, CourseVideo, CourseAssignment, SessionInfo

admin.site.register(User)
admin.site.register(Course)
admin.site.register(CourseVideo)
admin.site.register(CourseAssignment)
admin.site.register(SessionInfo)
