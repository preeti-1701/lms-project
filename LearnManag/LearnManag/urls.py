"""
URL configuration for LearnManag project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from authentication.views import login_page, dashboard_view
from course.views import get_courses, course_page
from video.views import video_page
urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/',include('authentication.urls')),
    path('course/', include('course.urls')),
    path('video-api/', include('video.urls')),
    path('', login_page),
    path('login/', login_page),
    path('dashboard/', dashboard_view),
    path('courses/', course_page),
    path('video/<int:course_id>/', video_page),
]
