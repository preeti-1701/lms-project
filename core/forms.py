"""Forms used in the LMS."""
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Course, CourseVideo


class LoginForm(forms.Form):
    """Login by email OR mobile number, plus password and a chosen role tab."""
    identifier = forms.CharField(label="Email or Mobile",
                                 widget=forms.TextInput(attrs={'placeholder': 'email@example.com or mobile'}))
    password = forms.CharField(widget=forms.PasswordInput)
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, widget=forms.HiddenInput)


class UserCreateForm(UserCreationForm):
    role = forms.ChoiceField(choices=User.ROLE_CHOICES)
    mobile = forms.CharField(required=False)
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'mobile', 'role', 'password1', 'password2')


class UserEditForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'mobile', 'role', 'is_disabled')


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ('title', 'description')


class CourseVideoForm(forms.ModelForm):
    class Meta:
        model = CourseVideo
        fields = ('title', 'youtube_url', 'position')
