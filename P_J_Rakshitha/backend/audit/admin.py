from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'timestamp']
    list_filter = ['action']
    search_fields = ['user__email']
    readonly_fields = ['user', 'action', 'ip_address', 'device_info', 'metadata', 'timestamp']