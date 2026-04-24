from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # LMS app
    path('api/', include('LMS.urls')),

    # Students app
    path('api/students/', include('Students.urls')),
]