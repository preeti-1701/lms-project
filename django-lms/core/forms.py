from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

from .models import Course, CourseVideo

User = get_user_model()


class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)
    full_name = forms.CharField(max_length=120, required=True, label="Full name")

    class Meta:
        model = User
        fields = ("username", "email", "full_name", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
            # signals create profile + default student role
            user.profile.full_name = self.cleaned_data["full_name"]
            user.profile.save(update_fields=["full_name"])
        return user


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ("title", "description")


class CourseVideoForm(forms.ModelForm):
    class Meta:
        model = CourseVideo
        fields = ("title", "youtube_url", "position")
