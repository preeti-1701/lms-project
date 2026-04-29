from urllib import request

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import User

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
    
class ForceLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        admin_user = request.user

        if admin_user.role != 'admin':
            return Response({"error": "Not allowed"}, status=403)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.token_version += 1
        user.save()

        return Response({"message": "User logged out from all devices"})