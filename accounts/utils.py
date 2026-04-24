from .models import UserSession
from rest_framework.response import Response

def validate_session(request):
    session_token = request.headers.get('Session-Token')

    if not session_token:
        return Response({'error': 'Session missing'}, status=401)

    session = UserSession.objects.filter(
        user=request.user,
        session_key=session_token,
        is_active=True
    ).first()

    if not session:
        return Response({'error': 'Session expired'}, status=401)

    return None