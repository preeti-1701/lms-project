from django.contrib import admin
from .models import User, LoginSession

admin.site.register(User)
admin.site.register(LoginSession)
