from .permissions import user_roles, is_admin, is_staff_role


def role_flags(request):
    user = request.user
    roles = user_roles(user) if user.is_authenticated else set()
    return {
        "user_role_set": roles,
        "is_admin_user": is_admin(user) if user.is_authenticated else False,
        "is_staff_user": is_staff_role(user) if user.is_authenticated else False,
    }
