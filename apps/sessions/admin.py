from django.contrib import admin
from django.utils import timezone
from .models import UserSession


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'ip_address', 'device_type', 'browser', 'os',
        'is_active', 'created_at', 'last_activity'
    ]
    list_filter = ['is_active', 'device_type', 'created_at']
    search_fields = ['user__email', 'ip_address', 'browser', 'os']
    readonly_fields = [
        'id', 'user', 'ip_address', 'user_agent', 'device_type',
        'browser', 'os', 'access_token', 'created_at', 'last_activity', 'logged_out_at'
    ]
    ordering = ['-created_at']

    fieldsets = (
        ('Session Info', {
            'fields': ('id', 'user', 'is_active')
        }),
        ('Device & Network', {
            'fields': ('ip_address', 'device_type', 'browser', 'os', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_activity', 'logged_out_at')
        }),
    )

    actions = ['terminate_sessions']

    @admin.action(description='Terminate selected sessions')
    def terminate_sessions(self, request, queryset):
        count = queryset.filter(is_active=True).update(
            is_active=False,
            logged_out_at=timezone.now()
        )
        self.message_user(request, f'{count} session(s) terminated.')