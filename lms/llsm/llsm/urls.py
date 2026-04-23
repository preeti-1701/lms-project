from django.urls import path, include
from django.shortcuts import redirect
from django.contrib import admin

urlpatterns = [
    path('', lambda request: redirect('login')),  # ✅ redirect root → login
    path('admin/', admin.site.urls),
    path('', include('llsm.accounts.urls')),
    path('courses/', include('llsm.courses.urls')),
]