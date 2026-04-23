from django.contrib import admin
from .models import SecurityLog

@admin.register(SecurityLog)
class SecurityLogAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'user', 'ip_address', 'timestamp')
    list_filter = ('event_type',)
    search_fields = ('user__email', 'ip_address')
    date_hierarchy = 'timestamp'
    readonly_fields = ('event_type', 'user', 'video', 'ip_address', 'user_agent', 'timestamp', 'extra_data')
    ordering = ('-timestamp',)
