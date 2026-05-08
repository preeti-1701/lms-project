"""
URL configuration for LMS project.

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
from django.urls import path , include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import CreateUserView, LoginView , ForceLogoutView, UpdateUserView , UsersListView

from users.views import login_page
from courses.views import admin_dashboard, dashboard, course_page, trainer_dashboard , trainer_manage_course_page, watch_video_page

urlpatterns = [
    path('', login_page),
    path('dashboard/', dashboard),
    path('course/<int:course_id>/', course_page),
    path('course/<int:course_id>/video/<int:video_id>/', watch_video_page),
    path('api/create-user/', CreateUserView.as_view()),
    path('trainer/', trainer_dashboard),
    path('admin-dashboard/', admin_dashboard),
    path('trainer/course/<int:course_id>/', trainer_manage_course_page),

    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view()),
    path('api/force-logout/<int:user_id>/', ForceLogoutView.as_view()),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/update-user/<int:user_id>/', UpdateUserView.as_view()),
    path('api/users/', UsersListView.as_view()),
    path('api/', include('courses.urls')),
]
