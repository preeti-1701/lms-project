from django.contrib.auth import logout
from django.contrib import messages
from django.contrib.sessions.models import Session


class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)

        if user and user.is_authenticated:
            # 🔴 If user is disabled → logout immediately
            if getattr(user, 'is_disabled', False):
                logout(request)
                messages.error(request, "Your account has been disabled.")
            else:
                expected = user.active_session_key
                current = request.session.session_key

                # 🔥 If session mismatch → logout (another login happened)
                if expected and current and expected != current:
                    try:
                        # Delete this invalid session from DB
                        Session.objects.filter(session_key=current).delete()
                    except Exception:
                        pass

                    logout(request)
                    messages.warning(
                        request,
                        "You were signed out because your account logged in from another device."
                    )

        return self.get_response(request)