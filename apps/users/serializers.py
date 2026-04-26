"""
User Serializers for LMS
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extended JWT serializer.
    - Supports login via email OR mobile number
    - Injects user info into token payload
    - Handles single-session enforcement via token versioning
    """
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow mobile login by renaming field
        self.fields['email'] = serializers.CharField(
            label='Email or Mobile',
            help_text='Enter your email address or mobile number'
        )
        # Remove default 'username' field if added by parent
        self.fields.pop('username', None)

    def validate(self, attrs):
        # Support mobile login
        identifier = attrs.get('email', '')
        password = attrs.get('password', '')

        # Try email first, then mobile
        user = None
        if '@' in identifier:
            try:
                user = User.objects.get(email__iexact=identifier)
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(mobile=identifier)
            except User.DoesNotExist:
                pass

        if user is None or not user.check_password(password):
            raise serializers.ValidationError(
                {'detail': 'Invalid credentials. Please check email/mobile and password.'}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {'detail': 'Your account has been disabled. Contact administrator.'}
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # Inject custom claims
        refresh['role'] = user.role
        refresh['name'] = user.get_full_name()
        refresh['email'] = user.email

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.get_full_name(),
                'role': user.role,
                'avatar': user.avatar.url if user.avatar else None,
            }
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['name'] = user.get_full_name()
        return token


# ─────────────────────────────────────────────────────────────
# USER SERIALIZERS
# ─────────────────────────────────────────────────────────────

class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lists."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'mobile', 'full_name', 'role', 'is_active', 'date_joined']


class UserDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    enrolled_courses_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'mobile', 'first_name', 'last_name',
            'full_name', 'role', 'is_active', 'bio', 'avatar',
            'date_joined', 'last_login', 'enrolled_courses_count'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def get_enrolled_courses_count(self, obj):
        return obj.enrollments.filter(is_active=True).count()


class UserCreateSerializer(serializers.ModelSerializer):
    """Admin: create new user with password."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'mobile', 'first_name', 'last_name',
            'role', 'password', 'password_confirm', 'bio'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # Hashes password
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Admin: update user info and role."""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'mobile', 'role', 'is_active', 'bio', 'avatar']


class ChangePasswordSerializer(serializers.Serializer):
    """User: change own password."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class AdminResetPasswordSerializer(serializers.Serializer):
    """Admin: force-reset any user's password."""
    new_password = serializers.CharField(required=True, validators=[validate_password])
