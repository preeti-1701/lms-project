from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    # 🔥 increase token version on login
    user.token_version += 1
    user.save()

    refresh = RefreshToken.for_user(user)

    # add custom field
    refresh['token_version'] = user.token_version

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }