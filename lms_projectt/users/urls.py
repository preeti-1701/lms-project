from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('register/', views.register),
    path('users/', views.all_users),
    path('login/', views.login_view),
    path('dashboard/', views.dashboard),
    path('logout/', views.logout_view),
    path('forgot/', views.forgot),
    path('verify-otp/', views.verify_otp),
    path('reset-password/', views.reset_password),
    path('add-course/', views.add_course),
    path('course/<int:id>/', views.course_detail),
    path('enroll/<int:id>/', views.enroll),
    path('upload-content/<int:id>/', views.upload_content),
    path('save-progress/', views.save_progress),
    path('complete/<int:id>/', views.mark_complete),
    path('delete-content/<int:id>/', views.delete_content),
    path('edit-content/<int:id>/', views.edit_content),
    path('students/<int:id>/', views.view_students),
    path('upload-assignment/<int:id>/', views.upload_assignment),
    path('assignments/<int:id>/', views.view_assignments),
    path('review/<int:id>/', views.mark_reviewed),
    path('my-submissions/', views.my_submissions),
    path('pending-assignments/', views.pending_assignments),
    path('reject/<int:id>/', views.reject_assignment),

  
    
]