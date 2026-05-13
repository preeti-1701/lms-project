from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    role = forms.ChoiceField(choices=CustomUser._meta.get_field('role').choices)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'role', 'password1', 'password2']

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.EmailField(label="Email")