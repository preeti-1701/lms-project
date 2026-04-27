from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, UserSession
from .serializers import LoginRequestSerializer, RefreshRequestSerializer


def _effective_role(user) -> str:
	if user.is_superuser or user.is_staff:
		return Profile.ROLE_ADMIN
	try:
		return user.profile.role
	except Profile.DoesNotExist:
		return Profile.ROLE_STUDENT


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = LoginRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		identifier = serializer.validated_data['identifier']
		password = serializer.validated_data['password']

		User = get_user_model()
		if '@' in identifier:
			user = User.objects.filter(email__iexact=identifier).first()
		else:
			user = User.objects.filter(profile__mobile=identifier).first()

		if user is None or not user.check_password(password):
			return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
		if not user.is_active:
			return Response({'detail': 'User is disabled'}, status=status.HTTP_403_FORBIDDEN)

		Profile.objects.get_or_create(user=user)
		session, _ = UserSession.objects.get_or_create(user=user)

		refresh = RefreshToken.for_user(user)
		access = refresh.access_token

		session.current_access_jti = str(access.get('jti', ''))
		session.current_refresh_jti = str(refresh.get('jti', ''))
		session.ip_address = request.META.get('REMOTE_ADDR')
		session.user_agent = request.META.get('HTTP_USER_AGENT', '')
		session.last_login_at = timezone.now()
		session.save(update_fields=[
			'current_access_jti',
			'current_refresh_jti',
			'ip_address',
			'user_agent',
			'last_login_at',
			'updated_at',
		])

		return Response(
			{
				'access': str(access),
				'refresh': str(refresh),
				'user': {
					'id': user.id,
					'username': user.get_username(),
					'email': user.email,
					'role': _effective_role(user),
				},
			},
			status=status.HTTP_200_OK,
		)


class RefreshView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RefreshRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		refresh_token = serializer.validated_data['refresh']

		try:
			refresh = RefreshToken(refresh_token)
		except Exception:
			return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

		user_id = refresh.get('user_id')
		if not user_id:
			return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

		User = get_user_model()
		user = User.objects.filter(id=user_id).first()
		if user is None or not user.is_active:
			return Response({'detail': 'Invalid user'}, status=status.HTTP_401_UNAUTHORIZED)

		session, _ = UserSession.objects.get_or_create(user=user)
		if not session.current_refresh_jti or session.current_refresh_jti != str(refresh.get('jti', '')):
			return Response({'detail': 'Session expired. Please login again.'}, status=status.HTTP_401_UNAUTHORIZED)

		access = refresh.access_token
		session.current_access_jti = str(access.get('jti', ''))
		session.save(update_fields=['current_access_jti', 'updated_at'])

		return Response({'access': str(access)}, status=status.HTTP_200_OK)


class LogoutView(APIView):
	def post(self, request):
		session, _ = UserSession.objects.get_or_create(user=request.user)
		session.current_access_jti = ''
		session.current_refresh_jti = ''
		session.save(update_fields=['current_access_jti', 'current_refresh_jti', 'updated_at'])
		return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
	def get(self, request):
		Profile.objects.get_or_create(user=request.user)
		return Response(
			{
				'id': request.user.id,
				'username': request.user.get_username(),
				'email': request.user.email,
				'role': _effective_role(request.user),
			},
			status=status.HTTP_200_OK,
		)

