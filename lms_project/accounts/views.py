from django.shortcuts import render , redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.sessions.models import Session
from django.utils import timezone
from .models import  User 
# Create your views here.
from django.contrib.sessions.models import Session
from django.shortcuts import get_object_or_404



from django.contrib.sessions.models import Session

def home_view(request):
    return render(request , 'home.html')

def login_view(request):
    if request.method == 'POST':
        # username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']
        user = authenticate(request, email=email, password=password , backend='accounts.backends.EmailBackend')

        if user:

           
            if user.active_session_key:
                Session.objects.filter(
                    session_key=user.active_session_key
                ).delete()

            login(request, user)

            request.session.save()

            user.active_session_key = request.session.session_key
            user.last_login_ip = get_client_ip(request)
            user.last_login_device = get_device_info(request)
            user.save()

            return redirect('dashboard')
        

        else:
            try:
                maybe = User.objects.get(email = email)
            except User.DoesNotExist:
                pass
            return render(request , 'login.html' , {'error':'Invalid email or password'})

    return render(request, 'login.html')

def logout_view(request):
    if request.user.is_authenticated:
        request.user.active_session_key = None
        request.user.save()

    logout(request)
    return redirect('login')


def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        role = request.POST['role']

        if User.objects.filter(email=email).exists():
            return render(request,'register.html',{'error':'Email already registered'})
        
        if User.objects.filter(username=username).exists():
            return render(request,'register.html' , {'error':'Username already taken'})

        user = User.objects.create_user(
            username=username,
            email = email,
            password=password,
            role=role
        )

        login(request , user , backend='accounts.backends.EmailBackend')

        return redirect('dashboard')

    return render(request, 'register.html')

def get_client_ip(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDER_FOR")
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_device_info(request):
    ua = request.META.get("HTTP_USER_AGENT" , '')
    if 'Chrome' in ua and 'Edg' not in ua:
        browser = 'Chrome'
    elif 'Firefox' in ua:
        browser = 'Firefox'
    elif 'Safari' in ua and 'Chrome' not in ua:
        browser = 'Safari'
    elif 'Edg' in ua:
        browser = 'Edge'
    else:
        browser = 'Unknown browser'


    if 'Windows' in ua:
        os_name = 'Windows'
    elif 'Android' in ua:
        os_name = 'Android'
    elif 'iPhone' in ua or 'iPad' in ua:
        os_name = 'iOS'
    elif 'Mac' in ua:
        os_name = 'macOS'
    elif 'Linux' in ua:
        os_name = 'Linux'
    else:
        os_name = 'Unknown OS'

    return f'{browser} on {os_name}'


def admin_required(view_func):
    from functools import wraps
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if request.user.role != 'admin' and not request.user.is_superuser:
            return redirect('dashboard')
        return view_func(request, *args, **kwargs)
    return wrapper


@admin_required
def admin_panel(request):
    if request.method == 'POST':

        if 'create_user' in request.POST:
            username = request.POST.get('username')
            email    = request.POST.get('email')
            password = request.POST.get('password')
            role     = request.POST.get('role')
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(
                    username=username, email=email,
                    password=password, role=role
                )

        elif 'edit_user' in request.POST:
            uid = request.POST.get('user_id')
            user = get_object_or_404(User, id=uid)
            user.username = request.POST.get('username', user.username)
            user.email = request.POST.get('email', user.email)
            user.role = request.POST.get('role', user.role)
            user.save()

        elif 'disable_user' in request.POST:
            uid  = request.POST.get('user_id')
            user = get_object_or_404(User, id=uid)
            if user != request.user:          # can't disable yourself
                user.is_disabled = True
                # also force logout
                if user.active_session_key:
                    Session.objects.filter(session_key=user.active_session_key).delete()
                    user.active_session_key = None
                user.save()

        elif 'enable_user' in request.POST:
            uid  = request.POST.get('user_id')
            user = get_object_or_404(User, id=uid)
            user.is_disabled = False
            user.save()

        elif 'force_logout' in request.POST:
            uid  = request.POST.get('user_id')
            user = get_object_or_404(User, id=uid)
            if user.active_session_key:
                Session.objects.filter(session_key=user.active_session_key).delete()
                user.active_session_key = None
                user.save()

        elif 'delete_user' in request.POST:
            uid  = request.POST.get('user_id')
            user = get_object_or_404(User, id=uid)
            if user != request.user:
                user.delete()

        return redirect('admin_panel')

    users = User.objects.all().order_by('role', 'username')
    return render(request, 'admin_panel.html', {'users': users})
