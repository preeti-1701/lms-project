<<<<<<< HEAD
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('course/<int:id>/', views.course_detail, name='course_detail'),
    path('register/', views.register, name='register'),
    path('complete/<int:id>/', views.mark_complete, name='complete'),
=======
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),   
    
>>>>>>> 4c6a6e1ec8dfdb21170a4440cb46d104e71d33ef
]