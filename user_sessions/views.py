from django.shortcuts import render, redirect

# LOGOUT FUNCTION
def logout_view(request):
    request.session.flush()   # clears session
    return redirect('/')      # go to login page