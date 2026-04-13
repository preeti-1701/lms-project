from django.contrib import admin
from .models import User

admin.site.register(User)

from .models import Course, Enrollment, CourseContent, Assignment

admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(CourseContent)
admin.site.register(Assignment)