# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # User Management
    path('users/', include('users.urls')),
    
    # Courses & Videos
    path('courses/', include('courses.urls')),
    path('enrollment/', include('enrollment.urls')),
    path('videos/', include('videos.urls')),
    
    # Dashboard with namespace (Important for 'dashboard:xxx')
    path('', include('dashboard.urls', namespace='dashboard')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)