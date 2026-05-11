from django.shortcuts import render
import uuid
from .models import UserSession

def create_user_session(user, request):
    client_info = get_client_info(request)
    session_token = str(uuid.uuid4())
    UserSession.objects.filter(user=user).delete()
    UserSession.objects.create(
        user=user,
        token=session_token,
        ip_address=client_info['ip_address'],
        device=client_info['device']
    )
    return session_token

def get_client_info(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    return {
        'ip_address': ip,
        'device': user_agent[:255] if user_agent else 'Unknown'
    }
