from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Course, Video


admin.site.register(Course)
admin.site.register(Video)
