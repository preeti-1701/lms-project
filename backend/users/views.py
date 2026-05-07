from django.contrib.auth import authenticate

from django.contrib.auth.hashers import (
    make_password
)

from rest_framework.decorators import (
    api_view
)

from rest_framework.response import (
    Response
)

from rest_framework_simplejwt.tokens import (
    RefreshToken
)

from .models import User


# ✅ LOGIN

@api_view(['POST'])
def login_view(request):

    username = request.data.get(
        "username"
    )

    password = request.data.get(
        "password"
    )

    user = authenticate(

        username=username,

        password=password
    )

    if user is not None:

        refresh = RefreshToken.for_user(
            user
        )

        return Response({

            "access":
            str(refresh.access_token),

            "refresh":
            str(refresh),

            "role":
            user.role,

            "user_id":
            user.id,

            "username":
            user.username
        })

    return Response({

        "error":
        "Invalid Credentials"

    }, status=401)


# ✅ USERS LIST

@api_view(['GET'])
def users_list(request):

    users = User.objects.all()

    data = []

    for u in users:

        data.append({

            "id":
            u.id,

            "username":
            u.username,

            "role":
            u.role,

            "is_disabled":
            u.is_disabled
        })

    return Response(data)


# ✅ CREATE USER

@api_view(['POST'])
def create_user(request):

    try:

        username = request.data.get(
            "username"
        )

        password = request.data.get(
            "password"
        )

        role = request.data.get(
            "role"
        )

        print(username)
        print(password)
        print(role)

        if User.objects.filter(
            username=username
        ).exists():

            return Response({

                "error":
                "Username already exists"
            }, status=400)

        user = User.objects.create_user(

            username=username,

            password=password
        )

        user.role = role

        user.save()

        return Response({

            "message":
            "User Created"
        })

    except Exception as e:

        print(e)

        return Response({

            "error":
            str(e)

        }, status=500)

# ✅ DISABLE USER

@api_view(['PUT'])
def disable_user(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

        user.is_disabled = True

        user.save()

        return Response({

            "message":
            "User Disabled"
        })

    except:

        return Response({

            "error":
            "User not found"

        }, status=404)
    
@api_view(['DELETE'])
def delete_user(request, username):

    try:

        user = User.objects.get(
            username=username
        )

        user.delete()

        return Response({

            "message":
            "User Deleted"
        })

    except Exception as e:

        return Response({

            "error":
            str(e)

        }, status=500)


# ✅ FORCE LOGOUT USER

@api_view(['PUT'])
def force_logout(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
        )

        user.active_session = ""

        user.save()

        return Response({

            "message":
            "User Logged Out"
        })

    except:

        return Response({

            "error":
            "User not found"

        }, status=404)