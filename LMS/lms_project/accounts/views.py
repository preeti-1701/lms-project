from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


# ================= CURRENT USER =================

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def current_user(request):

    return Response({
        "username": request.user.username,
        "role": request.user.role
    })


# ================= USER VIEWSET =================

class UserViewSet(viewsets.ModelViewSet):

    queryset = CustomUser.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated]