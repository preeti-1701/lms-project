from .models import User, Course, Enrollment
from django.contrib import admin
from .models import Video

admin.site.register(User)
admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(Video)