from rest_framework import serializers


class LoginRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RefreshRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class SignupRequestSerializer(serializers.Serializer):
    ROLE_STUDENT = 'student'
    ROLE_TRAINER = 'trainer'

    role = serializers.ChoiceField(choices=(ROLE_STUDENT, ROLE_TRAINER))
    email = serializers.EmailField(required=False, allow_blank=True)
    mobile = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip()
        mobile = (attrs.get('mobile') or '').strip()
        username = (attrs.get('username') or '').strip()

        if not email and not mobile:
            raise serializers.ValidationError('Provide at least one of email or mobile.')

        attrs['email'] = email or None
        attrs['mobile'] = mobile or None
        attrs['username'] = username or None
        return attrs


class ApproveTrainerRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()


class PromoteAdminRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
