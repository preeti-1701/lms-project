from .models import AuditLog


def log_event(user, action, request=None, metadata={}):
    ip_address = None
    device_info = ''

    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        device_info = request.META.get('HTTP_USER_AGENT', '')[:255]

    AuditLog.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        device_info=device_info,
        metadata=metadata
    )