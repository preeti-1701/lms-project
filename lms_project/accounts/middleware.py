from django.shortcuts import redirect
from django.contrib.auth import logout

EXCLUDED_PATHS = ['/login/', '/register/', '/admin/']

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if any(request.path.startswith(p) for p in EXCLUDED_PATHS):
            return self.get_response(request)

        if request.user.is_authenticated:
            session_key = request.session.session_key
            if request.user.active_session_key != session_key:
                logout(request)
                return redirect('login')

        return self.get_response(request)