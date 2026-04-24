from django.urls import path
from .views import register_user, add_course, get_courses, update_course, delete_course

# ✅ IMPORT THESE
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenSerializer


# ✅ DEFINE THIS CLASS (YOU MISSED THIS)
class MyTokenView(TokenObtainPairView):
    serializer_class = MyTokenSerializer


urlpatterns = [
    # 🔐 AUTH
    path('login/', MyTokenView.as_view(), name='login'),
    path('register/', register_user),
    path('delete-course/<int:pk>/', delete_course),
    # 📚 COURSES
    path('courses/', get_courses),
    path('add-course/', add_course),
    path('update-course/<int:pk>/', update_course),
]