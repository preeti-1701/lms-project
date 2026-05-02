from django.contrib import admin
from lsmapp.views import *
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),   # admin site redirect
    path('', include('lsmapp.urls')), # connecting to Lmsapp app
    path('courses/', include('courses.urls')), # connecting to courses app
]


 
 
 