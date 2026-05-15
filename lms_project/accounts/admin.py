from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ('email', 'username', 'role', 'last_login_ip', 'last_login_device', 'is_staff')
    list_filter = ('role', 'is_staff')

    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
        ('Session Info', {'fields': ('active_session_key', 'last_login_ip', 'last_login_device')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )

    readonly_fields = ('active_session_key', 'last_login_ip', 'last_login_device')