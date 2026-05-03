from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, "lms_app/home.html", context)