from urllib import request

from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate

from .utils import get_tokens_for_user
    
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is not None:
            user.last_login_ip = get_client_ip(request)
            user.last_login_device = request.META.get('HTTP_USER_AGENT')
            user.save()

            tokens = get_tokens_for_user(user)
            return Response(tokens)

        return Response({"error": "Invalid credentials"}, status=401)