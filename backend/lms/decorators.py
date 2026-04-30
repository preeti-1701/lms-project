from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps


def role_required(*roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if request.user.role not in roles:
                messages.error(request, "You don't have permission to access this page.")
                return redirect('home')
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator
