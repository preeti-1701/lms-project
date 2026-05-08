from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    # Increase token version on login
    user.token_version += 1
    user.save()

    refresh = RefreshToken.for_user(user)

    # Add custom fields to REFRESH token
    refresh['token_version'] = user.token_version
    refresh['email'] = user.email
    refresh['full_name'] = user.full_name # Add the user's name!

    # Add custom fields to ACCESS token
    access = refresh.access_token
    access['token_version'] = user.token_version
    access['email'] = user.email
    access['full_name'] = user.full_name # Add the user's name!

    return {
        'refresh': str(refresh),
        'access': str(access),
    }