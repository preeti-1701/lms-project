from django.http import HttpResponseRedirect
from django.contrib.auth import logout
from django.contrib import messages

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip for unauthenticated users or login/register pages
        if not request.user.is_authenticated or request.path in ['/users/login/', '/users/register/', '/admin/']:
            return self.get_response(request)

        response = self.get_response(request)
        return response