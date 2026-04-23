from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils.timezone import now
from .models import UserSession
from .serializers import SessionSerializer
from accounts.models import UserRole


@api_view(['GET'])
def sessions_list(request):
    try:
        if request.user.user_role.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    except UserRole.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    sessions = UserSession.objects.all()[:50]
    return Response(SessionSerializer(sessions, many=True).data)


@api_view(['POST'])
def force_logout(request, session_id):
    try:
        if request.user.user_role.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    except UserRole.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    try:
        session = UserSession.objects.get(id=session_id)
    except UserSession.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    session.is_active = False
    session.logout_at = now()
    session.save()
    return Response({'message': 'Session terminated'})
