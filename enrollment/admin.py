from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'enrolled_at', 'reviewed_at')
    list_filter = ('status', 'course')
    search_fields = ('student__email', 'course__title')
    actions = ['approve_requests', 'reject_requests']

    def approve_requests(self, request, queryset):
        for enrollment in queryset:
            enrollment.approve()
    approve_requests.short_description = "Approve selected enrollment requests"

    def reject_requests(self, request, queryset):
        for enrollment in queryset:
            enrollment.reject()
    reject_requests.short_description = "Reject selected enrollment requests"
