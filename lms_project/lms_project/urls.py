"""
URL configuration for lms_project project.

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
from django.urls import path

from core.views import home, student_dashboard, trainer_dashboard, admin_dashboard, unauthorized
from accounts.views import user_login, user_logout
from courses.views import course_list, course_detail
from enrollments.views import enroll_student

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', home, name='home'),

    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),

    path('student/', student_dashboard, name='student_dashboard'),
    path('trainer/', trainer_dashboard, name='trainer_dashboard'),
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),

    path('courses/', course_list, name='course_list'),
    path('course/<int:course_id>/', course_detail, name='course_detail'),

    path('enroll/', enroll_student, name='enroll_student'),

    path('unauthorized/', unauthorized, name='unauthorized'),
    path('course/<int:course_id>/', course_detail, name='course_detail'),
]