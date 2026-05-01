from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication

from accounts.models import UserSession
from accounts.utils import _check_session

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if request.path.startswith('/api/'):
            token_auth = TokenAuthentication()

            try:
                user_auth_tuple = token_auth.authenticate(request)

                if user_auth_tuple is not None:
                    user, _ = user_auth_tuple
                    request.user = user

                    _, error_message, status_code = _check_session(request, touch=True)

                    if error_message:
                        return JsonResponse({'error': error_message}, status=status_code)

            except Exception:
                return JsonResponse({'error': 'Unauthorized'}, status=401)

        return self.get_response(request)