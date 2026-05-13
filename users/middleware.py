# users/middleware.py
from django.contrib.sessions.models import Session
from django.contrib.auth import logout
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.deprecation import MiddlewareMixin


class SingleSessionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """Handle single session logic before view is processed"""
        
        # Skip for unauthenticated users or specific paths
        if not request.user.is_authenticated:
            return None

        skip_paths = ['/users/login/', '/users/logout/', '/admin/', '/static/', '/media/']
        if any(request.path.startswith(path) for path in skip_paths):
            return None

        if not request.session.session_key:
            request.session.save()

        current_session_key = request.session.session_key
        last_session_key = getattr(request.user, 'last_session_key', None)

        # Different session detected → logout old session
        if last_session_key and last_session_key != current_session_key:
            # Delete old session from database
            Session.objects.filter(session_key=last_session_key).delete()
            
            # Optional: Logout current user with message
            # logout(request)  # Uncomment if you want to force logout immediately
            # messages.warning(request, "You were logged out from another device.")

        # Update user's last session key
        if last_session_key != current_session_key:
            request.user.last_session_key = current_session_key
            request.user.save(update_fields=['last_session_key'])

        return None