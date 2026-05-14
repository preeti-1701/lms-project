from django.contrib.sessions.models import Session
from core.models import UserSession
from django.contrib.auth import logout
from django.utils import timezone

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            session_key = request.session.session_key
            if session_key:
                try:
                    user_session = UserSession.objects.get(user=request.user)
                    if user_session.session_key != session_key:
                        # User has logged in from elsewhere, logout current session
                        logout(request)
                        # Optionally add a message that they were logged out from another device
                except UserSession.DoesNotExist:
                    UserSession.objects.create(user=request.user, session_key=session_key)
        
        response = self.get_response(request)
        return response
