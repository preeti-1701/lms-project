from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("LMS Backend Running ✅")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),  # ✅ ADD THIS
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
]