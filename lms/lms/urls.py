from django.contrib import admin
from django.urls import path, include

# For media files
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Core app routes (login, dashboard, course, etc.)
    path('', include('core.urls')),
]


# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)