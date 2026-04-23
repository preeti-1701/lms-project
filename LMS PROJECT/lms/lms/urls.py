from django.contrib import admin
from django.urls import path, include

# 🔥 for media files
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # connect core app
    path('', include('core.urls')),
]

# 🔥 serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)