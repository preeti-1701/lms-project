from django.contrib import admin

from .models import Profile, UserSession


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'role', 'mobile')
	search_fields = ('user__username', 'user__email', 'mobile')
	list_filter = ('role',)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
	list_display = ('user', 'ip_address', 'last_login_at', 'updated_at')
	search_fields = ('user__username', 'user__email')

