from django.contrib.auth import logout
from django.shortcuts import redirect


class SessionTokenValidationMiddleware:
    """Ensure session token matches profile token for active user session."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            session_token = request.session.get("auth_token", "")
            profile_token = getattr(request.user.profile, "session_token", "")
            if not session_token or not profile_token or session_token != profile_token:
                logout(request)
                return redirect("login")

        return self.get_response(request)
