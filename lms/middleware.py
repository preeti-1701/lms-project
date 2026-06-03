from django.shortcuts import redirect
from django.contrib import messages
from django.contrib.auth import logout


class SingleSessionMiddleware:
    """
    Ensures only one active session per user.
    If the session key doesn't match the stored one, logs out the user.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.session.session_key:
            try:
                from lms.models import UserSession
                user_session = UserSession.objects.get(user=request.user)
                if user_session.session_key != request.session.session_key:
                    logout(request)
                    messages.warning(request, 'You were logged out because your account was accessed from another device.')
                    return redirect('login')
            except UserSession.DoesNotExist:
                pass
        response = self.get_response(request)
        return response
