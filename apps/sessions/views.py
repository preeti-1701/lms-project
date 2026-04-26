"""
Session Management Views
"""
import logging
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import UserSession
from .serializers import UserSessionSerializer
from apps.users.permissions import IsAdmin

logger = logging.getLogger('apps.sessions')


class MySessionsView(generics.ListAPIView):
    """
    GET /api/v1/sessions/my/
    Current user sees their own sessions.
    """
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user).order_by('-created_at')


class AllSessionsView(generics.ListAPIView):
    """
    GET /api/v1/sessions/
    Admin: view all sessions across all users.
    """
    serializer_class = UserSessionSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['user', 'is_active', 'device_type']
    search_fields = ['user__email', 'ip_address']

    def get_queryset(self):
        return UserSession.objects.select_related('user').order_by('-created_at')


@api_view(['POST'])
@permission_classes([IsAdmin])
def force_logout_user(request, user_id):
    """
    POST /api/v1/sessions/force-logout/{user_id}/
    Admin: terminate all active sessions for a specific user.
    """
    count = UserSession.objects.filter(
        user_id=user_id, is_active=True
    ).update(is_active=False, logged_out_at=timezone.now())

    logger.warning(
        f"Admin {request.user.email} force-logged-out user {user_id}. "
        f"Sessions terminated: {count}"
    )
    return Response({
        'detail': f'{count} active session(s) terminated.',
        'sessions_terminated': count,
    })


@api_view(['POST'])
@permission_classes([IsAdmin])
def terminate_session(request, session_id):
    """
    POST /api/v1/sessions/{session_id}/terminate/
    Admin: terminate a specific session.
    """
    try:
        session = UserSession.objects.get(id=session_id)
        session.is_active = False
        session.logged_out_at = timezone.now()
        session.save()
        return Response({'detail': 'Session terminated.'})
    except UserSession.DoesNotExist:
        return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
