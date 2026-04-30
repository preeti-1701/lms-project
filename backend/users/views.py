from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, UserSession
from .permissions import IsAdmin
from .serializers import (
	ApproveTrainerRequestSerializer,
	LoginRequestSerializer,
	PromoteAdminRequestSerializer,
	RefreshRequestSerializer,
	SignupRequestSerializer,
)


def _effective_role(user) -> str:
	if user.is_superuser or user.is_staff:
		return Profile.ROLE_ADMIN
	try:
		return user.profile.role
	except Profile.DoesNotExist:
		return Profile.ROLE_STUDENT


def _is_approved(user) -> bool:
	if user.is_superuser or user.is_staff:
		return True
	try:
		return bool(user.profile.is_approved)
	except Profile.DoesNotExist:
		return True


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
					'approved': _is_approved(user),
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
				'approved': _is_approved(request.user),
			},
			status=status.HTTP_200_OK,
		)


class SignupView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = SignupRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		role = data['role']
		email = data.get('email')
		mobile = data.get('mobile')
		username = data.get('username')
		password = data['password']

		# Students can start immediately. Trainers require admin approval.
		is_approved = role == Profile.ROLE_STUDENT

		User = get_user_model()
		username_value = username or email or mobile
		if not username_value:
			return Response({'detail': 'Invalid username/email/mobile.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			with transaction.atomic():
				if email and User.objects.filter(email__iexact=email).exists():
					return Response({'detail': 'Email already in use.'}, status=status.HTTP_400_BAD_REQUEST)

				# mobile is stored on Profile and must be unique
				if mobile and Profile.objects.filter(mobile=mobile).exists():
					return Response({'detail': 'Mobile already in use.'}, status=status.HTTP_400_BAD_REQUEST)

				user = User.objects.create(username=username_value, email=email or '')
				user.set_password(password)
				user.save(update_fields=['password', 'email'])

				profile, _ = Profile.objects.get_or_create(user=user)
				profile.role = role
				profile.is_approved = is_approved
				profile.mobile = mobile
				profile.save(update_fields=['role', 'is_approved', 'mobile'])

				UserSession.objects.get_or_create(user=user)
		except IntegrityError:
			return Response({'detail': 'Could not create account. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

		return Response(
			{
				'id': user.id,
				'username': user.get_username(),
				'email': user.email,
				'role': profile.role,
				'approved': bool(profile.is_approved),
			},
			status=status.HTTP_201_CREATED,
		)


class PendingTrainersView(APIView):
	permission_classes = [IsAdmin]

	def get(self, request):
		pending = (
			Profile.objects.filter(role=Profile.ROLE_TRAINER, is_approved=False)
			.select_related('user')
			.order_by('user_id')
		)
		return Response(
			[
				{
					'user_id': p.user_id,
					'username': p.user.get_username(),
					'email': p.user.email,
					'mobile': p.mobile,
					'role': p.role,
					'approved': bool(p.is_approved),
				}
				for p in pending
			],
			status=status.HTTP_200_OK,
		)


class ApproveTrainerView(APIView):
	permission_classes = [IsAdmin]

	def post(self, request):
		serializer = ApproveTrainerRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user_id = serializer.validated_data['user_id']

		profile = Profile.objects.filter(user_id=user_id).select_related('user').first()
		if profile is None:
			return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
		if profile.role != Profile.ROLE_TRAINER:
			return Response({'detail': 'User is not a trainer.'}, status=status.HTTP_400_BAD_REQUEST)

		profile.is_approved = True
		profile.save(update_fields=['is_approved'])

		return Response(
			{
				'user_id': profile.user_id,
				'username': profile.user.get_username(),
				'email': profile.user.email,
				'role': profile.role,
				'approved': bool(profile.is_approved),
			},
			status=status.HTTP_200_OK,
		)


class PromoteAdminView(APIView):
	permission_classes = [IsAdmin]

	def post(self, request):
		serializer = PromoteAdminRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user_id = serializer.validated_data['user_id']

		User = get_user_model()
		user = User.objects.filter(id=user_id).first()
		if user is None:
			return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

		profile, _ = Profile.objects.get_or_create(user=user)
		profile.role = Profile.ROLE_ADMIN
		profile.is_approved = True
		profile.save(update_fields=['role', 'is_approved'])

		if not user.is_staff:
			user.is_staff = True
			user.save(update_fields=['is_staff'])

		return Response(
			{
				'user_id': user.id,
				'username': user.get_username(),
				'email': user.email,
				'role': _effective_role(user),
				'approved': _is_approved(user),
			},
			status=status.HTTP_200_OK,
		)

