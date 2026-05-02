from django.urls import path, include
from django.shortcuts import redirect
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', lambda request: redirect('login')),  # ✅ redirect root → login
    path('admin/', admin.site.urls),
    path('', include('llsm.accounts.urls')),
    path('courses/', include('llsm.courses.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)