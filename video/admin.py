from django.contrib import admin
from .models import Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'duration_display', 'created_at')
    search_fields = ('title', 'lesson__title')
    readonly_fields = ('duration_display',)  # computed property, not editable