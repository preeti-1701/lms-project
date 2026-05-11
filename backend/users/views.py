import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, UserSession, SecurityLog
from .serializers import UserSerializer, UserCreateSerializer

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_device_info(self, user_agent):
        ua = user_agent.lower()
        device = 'Desktop'
        browser = 'Unknown'
        os = 'Unknown'
        
        if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
            device = 'Mobile'
        if 'chrome' in ua:
            browser = 'Chrome'
        elif 'firefox' in ua:
            browser = 'Firefox'
        elif 'safari' in ua:
            browser = 'Safari'
        elif 'edge' in ua:
            browser = 'Edge'
        if 'windows' in ua:
            os = 'Windows'
        elif 'mac' in ua:
            os = 'Mac'
        elif 'linux' in ua:
            os = 'Linux'
        elif 'android' in ua:
            os = 'Android'
        
        return {'device': device, 'browser': browser, 'os': os}
    
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password required'}, status=400)
        
        user = authenticate(username=email, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)
        
        if not user.is_active:
            return Response({'error': 'Account disabled'}, status=401)
        
        # Get client info
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        device_info = self.get_device_info(user_agent)
        
        # Generate session key
        session_key = str(uuid.uuid4())
        
        # Create JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Create session
        session = UserSession.objects.create(
            user=user,
            session_key=session_key,
            token=access_token,
            ip_address=ip_address,
            device_info=f"{device_info['device']} - {device_info['os']} - {device_info['browser']}",
            browser=device_info['browser'],
            os=device_info['os']
        )
        
        # Log login
        SecurityLog.objects.create(
            user=user,
            session=session,
            action='login',
            ip_address=ip_address,
            device_info=f"{device_info['device']} - {device_info['os']} - {device_info['browser']}",
            details={'session_key': session_key}
        )
        
        # Enforce single session (auto-logout previous)
        UserSession.objects.filter(user=user, is_active=True).exclude(id=session.id).update(is_active=False)
        
        return Response({
            'access': access_token,
            'refresh': str(refresh),
            'session_key': session_key,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'role': user.role
            },
            'session_info': {
                'ip': ip_address,
                'device': device_info['device'],
                'browser': device_info['browser'],
                'os': device_info['os'],
                'login_time': session.login_time.isoformat()
            }
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        token = request.auth
        session = UserSession.objects.filter(token=str(token), is_active=True).first()
        if session:
            session.is_active = False
            session.logout_time = timezone.now()
            session.save()
            
            SecurityLog.objects.create(
                user=request.user,
                session=session,
                action='logout',
                details={'session_key': session.session_key}
            )
        
        return Response({'message': 'Logged out successfully'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        token = request.auth
        session = UserSession.objects.filter(token=str(token), is_active=True).first()
        
        return Response({
            'id': str(request.user.id),
            'email': request.user.email,
            'name': request.user.name,
            'role': request.user.role,
            'session_info': {
                'session_key': session.session_key if session else None,
                'ip': session.ip_address if session else None,
                'device': session.device_info if session else None,
                'login_time': session.login_time.isoformat() if session else None
            }
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def security_alert(self, request):
        """Log security alerts from frontend"""
        alert_type = request.data.get('alert_type')
        details = request.data.get('details', {})
        
        token = request.auth
        session = UserSession.objects.filter(token=str(token), is_active=True).first()
        
        SecurityLog.objects.create(
            user=request.user,
            session=session,
            action=alert_type,
            ip_address=request.META.get('REMOTE_ADDR'),
            device_info=request.META.get('HTTP_USER_AGENT', ''),
            details=details
        )
        
        return Response({'message': 'Alert logged'})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def sessions(self, request):
        """Get all active sessions (Admin only)"""
        if request.user.role != 'admin':
            return Response({'error': 'Access denied'}, status=403)
        
        sessions = UserSession.objects.all().select_related('user')
        data = [{
            'id': str(s.id),
            'user': s.user.email,
            'session_key': s.session_key,
            'ip': s.ip_address,
            'device': s.device_info,
            'login_time': s.login_time.isoformat(),
            'last_activity': s.last_activity.isoformat(),
            'is_active': s.is_active
        } for s in sessions]
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def security_logs(self, request):
        """Get security logs (Admin only)"""
        if request.user.role != 'admin':
            return Response({'error': 'Access denied'}, status=403)
        
        logs = SecurityLog.objects.all().select_related('user', 'session')[:100]
        data = [{
            'id': str(l.id),
            'user': l.user.email if l.user else 'Unknown',
            'action': l.action,
            'ip': l.ip_address,
            'device': l.device_info,
            'details': l.details,
            'time': l.created_at.isoformat()
        } for l in logs]
        
        return Response(data)