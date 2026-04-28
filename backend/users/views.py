from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# 🔐 LOGIN
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
           "role": getattr(user, "role", "student") or "student"
        })

    return Response({"error": "Invalid credentials"}, status=401)


# 👥 USERS LIST
@api_view(['GET'])
def users_list(request):
    users = User.objects.all()

    data = []
    for u in users:
        data.append({
            "id": u.id,
            "username": u.username,
            "role": getattr(u, "role", "student")
        })

    return Response(data)