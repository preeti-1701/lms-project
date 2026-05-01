from django.shortcuts import redirect

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.role != 'admin':
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return wrapper

def trainer_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.role != 'trainer':
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return wrapper