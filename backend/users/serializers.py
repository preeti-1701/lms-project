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
    name = serializers.CharField()
    email = serializers.EmailField()
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        name = (attrs.get('name') or '').strip()
        email = (attrs.get('email') or '').strip()
        username = (attrs.get('username') or '').strip()

        if not name:
            raise serializers.ValidationError('Name is required.')
        if not email:
            raise serializers.ValidationError('Email is required.')

        attrs['name'] = name
        attrs['email'] = email
        attrs['username'] = username or None
        return attrs


class ApproveTrainerRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()


class PromoteAdminRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
