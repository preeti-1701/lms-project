from django.contrib import admin
from .models import Course , Video

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title' , 'trainer')
    filter_horizontal = ('students',)
# Register your models here.
admin.site.register(Course , CourseAdmin)
admin.site.register(Video)