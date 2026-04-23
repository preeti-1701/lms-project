from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from .models import User, LoginSession
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer
from .permissions import IsAdmin


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            ip_address = self.get_client_ip(request)
            device = request.META.get("HTTP_USER_AGENT", "")[:255]

            auth_login(request, user)

            session_key = request.session.session_key

            existing_session = LoginSession.objects.filter(
                user=user, session_key=session_key, is_active=True
            ).first()

            if existing_session:
                LoginSession.objects.filter(user=user, is_active=True).exclude(
                    session_key=session_key
                ).update(is_active=False)
            else:
                LoginSession.objects.filter(user=user, is_active=True).update(
                    is_active=False
                )
                LoginSession.objects.create(
                    user=user,
                    ip_address=ip_address,
                    device=device,
                    session_key=session_key,
                    is_active=True,
                    expires_at=timezone.now()
                    + timedelta(days=settings.SESSION_EXPIRY_DAYS),
                )

            return Response(
                {
                    "message": "login successful",
                    "user": UserSerializer(user).data,
                    "token": session_key,
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")


class LogoutAPIView(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request):
        LoginSession.objects.filter(user=request.user, is_active=True).update(
            is_active=False
        )
        auth_logout(request)
        return Response({"message": "logout successful"})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def disable(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        LoginSession.objects.filter(user=user, is_active=True).update(is_active=False)
        return Response({"message": "user disabled"})
