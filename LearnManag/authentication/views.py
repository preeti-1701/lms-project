from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
import json

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        email = data.get('email')
        password = data.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:

            # 🔥 SINGLE SESSION LOGIC
            # Delete previous sessions of this user
            sessions = Session.objects.all()
            for session in sessions:
                data = session.get_decoded()
                if data.get('_auth_user_id') == str(user.id):
                    session.delete()

            # Login user
            login(request, user)

            return JsonResponse({
                'message': 'Login successful',
                'role': user.role
            })

        return JsonResponse({'error': 'Invalid credentials'}, status=401)


def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out'})

def dashboard_view(request):
    return render(request, 'dashboard.html')

def login_page(request):
    return render(request, 'login.html')


