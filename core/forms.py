from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Course, Lesson


class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, widget=forms.Select, initial='student')

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = self.cleaned_data.get('role', 'student')
        if commit:
            user.save()
        return user


class UserCreateForm(UserCreationForm):
    email = forms.EmailField(required=True)
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, widget=forms.Select)

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'password1', 'password2']


class UserEditForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'is_active']


class CourseForm(forms.ModelForm):
    topics = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter topics separated by commas'}),
        required=False,
        help_text="Separate topics with commas"
    )

    class Meta:
        model = Course
        fields = ['title', 'description', 'topics', 'duration', 'trainer', 'status', 'version']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

    def clean_topics(self):
        topics_raw = self.cleaned_data.get('topics', '')
        if isinstance(topics_raw, str):
            return [t.strip() for t in topics_raw.split(',') if t.strip()]
        return topics_raw

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['trainer'].queryset = User.objects.filter(role='trainer')
        if self.instance and self.instance.pk and isinstance(self.instance.topics, list):
            self.fields['topics'].initial = ', '.join(self.instance.topics)


class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = ['title', 'video_url', 'order']
        help_texts = {
            'video_url': 'Use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID',
        }

    def clean_video_url(self):
        url = self.cleaned_data.get('video_url', '')
        if url and 'youtube.com/embed' not in url and 'youtu.be' not in url:
            raise forms.ValidationError("Please provide a valid YouTube embed URL.")
        if 'youtu.be' in url:
            # Convert short URL to embed
            video_id = url.split('/')[-1].split('?')[0]
            url = f"https://www.youtube.com/embed/{video_id}"
        return url

