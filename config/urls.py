from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path

from core.forms import IdentifierAuthenticationForm

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "login/",
        auth_views.LoginView.as_view(
            template_name="login.html",
            authentication_form=IdentifierAuthenticationForm,
        ),
        name="login",
    ),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("", include("core.urls")),
]
