from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Course, Video


class CustomUserAdmin(UserAdmin):
    model = User

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'age', 'role')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'age', 'role', 'password1', 'password2'),
        }),
    )

    list_display = ('username', 'email', 'role')
    filter_horizontal = ()
    list_filter = ()


admin.site.register(User, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(Video)