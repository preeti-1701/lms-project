from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend:
    def authenticate(self , request , username=None , email = None , password=None):
        try:
            if email:

                user = User.objects.get(email=email)
            else:
                user = User.objects.get(username=username)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        
    def get_user(self,user_id):
        try:

            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None