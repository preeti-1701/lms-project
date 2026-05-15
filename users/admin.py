from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'approval_status', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    actions = ['approve_accounts', 'reject_accounts']

    fieldsets = UserAdmin.fieldsets + (
        ('LMS Profile', {'fields': ('role', 'phone', 'last_session_key')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('LMS Profile', {'fields': ('email', 'role', 'phone')}),
    )

    @admin.display(description='Approval')
    def approval_status(self, obj):
        if obj.is_active:
            return 'Approved'
        if obj.role in ['trainer', 'admin']:
            return 'Pending approval'
        return 'Inactive'

    def approve_accounts(self, request, queryset):
        for user in queryset:
            user.is_active = True
            user.is_staff = user.role == 'admin' or user.is_superuser
            user.save(update_fields=['is_active', 'is_staff'])
    approve_accounts.short_description = "Approve selected accounts"

    def reject_accounts(self, request, queryset):
        queryset.filter(is_superuser=False).update(is_active=False, is_staff=False)
    reject_accounts.short_description = "Reject/deactivate selected accounts"
