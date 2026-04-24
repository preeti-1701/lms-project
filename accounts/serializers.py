from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import UserSession
from rest_framework_simplejwt.tokens import RefreshToken 

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    def validate(self,data):
        request = self.context.get('request')
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError(
                "Username and password are required."
            )
        
        user = authenticate(request=request, username=username, password = password)

        if not user:
            raise serializers.ValidationError('invalid username or password')
        
        if not user.is_active:
            raise serializers.ValidationError('User Account is Disabled')
        

        ## Generate JWT Tokens 
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        ## Get IP and device info
        ip_address = request.META.get('REMOTE_ADDR','0.0.0.0')
        device_info = request.META.get('HTTP_USER_AGENT','unknown Device')

        # existing_sessions = UserSession.objects.filter(user=user, is_active=True)

        # for session in existing_sessions:
        #     if session.ip_address != ip_address:
        #         session.is_active = False
        #         session.save()


        ## Enforce Single Active session
        UserSession.objects.filter(user = user , is_active=True).update(is_active=False)

        UserSession.objects.create(
            user = user,
            token = access_token,
            ip_address = ip_address,
            device_info=device_info,
            is_active = True
        )

        ## update user's Last login details
        user.last_login_ip = ip_address
        user.last_login_device = device_info

        user.save(update_fields=['last_login_ip','last_login_device'])

        return {
            'refresh':str(refresh),
            'access' : access_token,
            'user':{
                'id':user.id,
                'username':user.username,
                'email':user.email,
                'role':user.role
            }
        }


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password =  serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "confirm_password",
            "role"
        ]

    def validate(self,data):
        if data["password"] != data["confirm_password"] :
            raise serializers.ValidationError({"message":"password does not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(**validated_data)
        return user