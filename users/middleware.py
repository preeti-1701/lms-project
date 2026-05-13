from django.http import JsonResponse
from django.contrib.auth import logout
from django.shortcuts import redirect
from .models import CustomUser

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Simple session key check (can be enhanced with DB session table)
            current_session_key = request.session.session_key
            if not hasattr(request.user, 'last_session_key') or request.user.last_session_key != current_session_key:
                # Force logout old sessions (basic implementation)
                pass

        response = self.get_response(request)
        return response