from django import forms
from django.contrib.auth import authenticate, get_user_model

from .models import Course, Lesson, User


class LoginForm(forms.Form):
    identifier = forms.CharField(label='Email or mobile', max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)

    def __init__(self, request=None, *args, **kwargs):
        self.request = request
        self.user_cache = None
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned = super().clean()
        identifier = cleaned.get('identifier')
        password = cleaned.get('password')
        if identifier and password:
            self.user_cache = authenticate(self.request, username=identifier, password=password)
            if self.user_cache is None:
                raise forms.ValidationError('Please enter a valid email/mobile and password.')
        return cleaned

    def get_user(self):
        return self.user_cache


class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False, help_text='Leave blank to keep the current password.')

    class Meta:
        model = get_user_model()
        fields = ('username', 'first_name', 'last_name', 'email', 'mobile', 'role', 'is_active', 'password')

    def clean(self):
        cleaned = super().clean()
        role = cleaned.get('role')
        if role == User.Roles.ADMIN:
            cleaned['is_staff'] = True
        return cleaned

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_password = self.instance.password if self.instance and self.instance.pk else None
        self.fields['password'].initial = ''

    def save(self, commit=True):
        user = super().save(commit=False)
        if self.cleaned_data.get('role') == User.Roles.ADMIN:
            user.is_staff = True
        if self.cleaned_data.get('password'):
            user.set_password(self.cleaned_data['password'])
        elif self._original_password:
            user.password = self._original_password
        if commit:
            user.save()
        return user


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ('title', 'summary', 'trainer', 'students', 'cover_color', 'is_published')
        widgets = {
            'summary': forms.Textarea(attrs={'rows': 4}),
            'students': forms.CheckboxSelectMultiple,
            'cover_color': forms.TextInput(attrs={'type': 'color'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        UserModel = get_user_model()
        self.fields['trainer'].queryset = UserModel.objects.filter(role=User.Roles.TRAINER, is_active=True)
        self.fields['students'].queryset = UserModel.objects.filter(role=User.Roles.STUDENT, is_active=True)
        self.fields['trainer'].required = False


class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = ('course', 'title', 'youtube_url', 'description', 'order')
        widgets = {'description': forms.Textarea(attrs={'rows': 3})}

    def __init__(self, *args, trainer=None, **kwargs):
        super().__init__(*args, **kwargs)
        if trainer and trainer.is_trainer_role:
            self.fields['course'].queryset = Course.objects.filter(trainer=trainer)
