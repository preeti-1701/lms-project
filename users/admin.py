from .models import User, Course, Enrollment
from django.contrib import admin

admin.site.register(User)
admin.site.register(Course)
admin.site.register(Enrollment)