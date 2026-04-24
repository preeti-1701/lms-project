from django.contrib import auth, messages
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone

from .models import UserSession


class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            tracked = UserSession.objects.filter(user=request.user).first()
            allowed_paths = {reverse('logout')}
            if tracked and request.path not in allowed_paths:
                if tracked.force_logged_out or tracked.session_key != request.session.session_key:
                    auth.logout(request)
                    messages.warning(request, 'Your session ended because your account was used elsewhere or logged out by admin.')
                    return redirect('login')
                tracked.last_seen = timezone.now()
                tracked.save(update_fields=['last_seen'])
        return self.get_response(request)
