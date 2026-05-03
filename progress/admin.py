from django.contrib import admin
from .models import Progress


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'is_completed', 'completed_at', 'updated_at']
    list_filter = ['is_completed', 'updated_at']
    search_fields = ['student__username', 'lesson__title']
    readonly_fields = ['updated_at']

