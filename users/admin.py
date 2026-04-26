from django.contrib import admin
from .models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'is_active')   # columns shown
    list_filter = ('role', 'is_active')                     # right side filters
    search_fields = ('name', 'email')                       # search box

admin.site.register(User, UserAdmin)