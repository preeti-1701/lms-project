from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)

    # add 'role' and 'bio' to the edit form
    fieldsets = UserAdmin.fieldsets + (
        ('LMS Info', {'fields': ('role', 'bio', 'avatar')}),
    )

    # add 'role' to the create user form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('LMS Info', {'fields': ('role',)}),
    )