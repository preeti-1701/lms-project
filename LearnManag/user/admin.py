from django.contrib import admin
from django.contrib.auth.hashers import make_password
from .models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'is_active')
    search_fields = ('email', 'name')
    list_filter = ('role', 'is_active')
    
    def save_model(self, request, obj, form, change):
        # If a new password is set and it's not already hashed, hash it
        if obj.password and not obj.password.startswith('pbkdf2_'):
            obj.password = make_password(obj.password)
        super().save_model(request, obj, form, change)

admin.site.register(User, UserAdmin)
