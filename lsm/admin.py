from django.contrib import admin
from .models import Course, Enrollment, Student, Video

admin.site.register(Course)
admin.site.register(Video)
admin.site.register(Student)
admin.site.register(Enrollment)