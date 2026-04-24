from django.contrib import admin
from .models import User
from .models import Profile
from .models import Course, Enrollment, CourseContent, Assignment

admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(CourseContent)
admin.site.register(Assignment)
admin.site.register(Profile)
