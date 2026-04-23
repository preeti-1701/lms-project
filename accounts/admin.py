from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserSession

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'role', 'is_active', 'date_joined', 'last_login_ip')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'full_name', 'mobile')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'mobile')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Security', {'fields': ('last_login_ip', 'last_login_device')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'full_name', 'role', 'password1', 'password2')}),
    )

    @admin.action(description='Force logout selected users')
    def force_logout(self, request, queryset):
        from .models import UserSession
        UserSession.objects.filter(user__in=queryset, is_active=True).update(is_active=False)
    actions = ['force_logout']

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'created_at', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('user__email', 'ip_address')

admin.site.site_header = "LMS Administration"
admin.site.site_title = "LMS Admin"
admin.site.index_title = "Welcome to NewGen LMS Admin"
