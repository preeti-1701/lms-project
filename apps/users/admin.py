from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.sessions.models import UserSession

User = get_user_model()


class ActiveSessionInline(admin.TabularInline):
    model = UserSession
    extra = 0
    readonly_fields = ['ip_address', 'device_type', 'user_agent', 'created_at', 'last_activity']
    fields = ['ip_address', 'device_type', 'is_active', 'created_at', 'last_activity']
    can_delete = True

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_active=True)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'email', 'get_full_name', 'mobile', 'role',
        'is_active', 'date_joined', 'last_login',
    ]
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'mobile']
    ordering = ['-date_joined']
    readonly_fields = ['id', 'date_joined', 'last_login']

    fieldsets = (
        (_('Account'), {
            'fields': ('id', 'email', 'mobile', 'password')
        }),
        (_('Personal Info'), {
            'fields': ('first_name', 'last_name', 'bio', 'avatar')
        }),
        (_('Role & Permissions'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser',
                       'groups', 'user_permissions'),
        }),
        (_('Important Dates'), {
            'fields': ('last_login', 'date_joined'),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'mobile', 'first_name', 'last_name',
                'role', 'password1', 'password2', 'is_active'
            ),
        }),
    )

    inlines = [ActiveSessionInline]

    actions = ['activate_users', 'deactivate_users', 'force_logout_selected']

    @admin.action(description='Activate selected users')
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated.')

    @admin.action(description='Deactivate selected users')
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        UserSession.objects.filter(
            user__in=queryset, is_active=True
        ).update(is_active=False, logged_out_at=timezone.now())
        self.message_user(request, f'{updated} user(s) deactivated.')

    @admin.action(description='Force logout selected users')
    def force_logout_selected(self, request, queryset):
        count = UserSession.objects.filter(
            user__in=queryset, is_active=True
        ).update(is_active=False, logged_out_at=timezone.now())
        self.message_user(request, f'{count} session(s) terminated.')