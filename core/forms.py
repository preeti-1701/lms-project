from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Course, Lesson, Quiz, Question


class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(required=True, max_length=30)
    last_name = forms.CharField(required=True, max_length=30)
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, initial='student')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'role', 'password1', 'password2')


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['title', 'description', 'level', 'category', 'thumbnail_emoji', 'accent_color']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'accent_color': forms.TextInput(attrs={'type': 'color'}),
        }


class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = ['title', 'content', 'video_url', 'order', 'duration_minutes']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 8}),
        }


class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['title', 'description', 'pass_score']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['text', 'choice_a', 'choice_b', 'choice_c', 'choice_d', 'correct_answer', 'order']
        widgets = {
            'text': forms.Textarea(attrs={'rows': 2}),
        }
