from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

from .models import Course, Enrollment, Profile, Video

User = get_user_model()
MANAGEABLE_ROLE_CHOICES = [
    (Profile.Role.TRAINER, "Trainer"),
    (Profile.Role.STUDENT, "Student"),
]


class LMSUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=False)
    role = forms.ChoiceField(choices=MANAGEABLE_ROLE_CHOICES)
    mobile = forms.CharField(required=False, max_length=20)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email", "role", "mobile", "password1", "password2")


class UserUpdateForm(forms.ModelForm):
    role = forms.ChoiceField(choices=MANAGEABLE_ROLE_CHOICES)
    mobile = forms.CharField(required=False, max_length=20)

    class Meta:
        model = User
        fields = ("username", "email", "is_active")


class CourseForm(forms.ModelForm):
    youtube_url = forms.URLField(label="YouTube Link", help_text="Paste one YouTube link")

    class Meta:
        model = Course
        fields = ("title", "description")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.order_fields(["title", "description", "youtube_url"])


class VideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ("title", "youtube_url", "brief_detail", "position")


class EnrollmentForm(forms.Form):
    students = forms.ModelMultipleChoiceField(
        queryset=User.objects.none(),
        widget=forms.CheckboxSelectMultiple,
        required=True,
        label="Students",
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["students"].queryset = User.objects.filter(profile__role=Profile.Role.STUDENT).order_by("username")


class IdentifierAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label="Email or Mobile",
        widget=forms.TextInput(attrs={"autofocus": True}),
    )
