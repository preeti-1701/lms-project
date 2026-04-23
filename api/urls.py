from django.urls import path, include

urlpatterns = [
    path('', include('accounts.urls')),
    path('courses/', include('courses.urls')),
    path('enrollments/', include('enrollments.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('security/', include('security.urls')),
]
