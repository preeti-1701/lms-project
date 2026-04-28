from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate

from .utils import get_tokens_for_user


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response(tokens)

        return Response({"error": "Invalid credentials"}, status=401)