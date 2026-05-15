from django.test import TestCase
from django.urls import reverse

from .forms import CustomUserCreationForm
from .models import CustomUser


class RegistrationApprovalTests(TestCase):
    def test_student_registration_is_active_immediately(self):
        response = self.client.post(reverse('register'), {
            'username': 'student',
            'email': 'student@example.com',
            'role': 'student',
            'password1': 'pass12345Strong',
            'password2': 'pass12345Strong',
        })

        self.assertRedirects(response, reverse('login'))
        user = CustomUser.objects.get(email='student@example.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_trainer_registration_waits_for_admin_approval(self):
        response = self.client.post(reverse('register'), {
            'username': 'trainer',
            'email': 'trainer@example.com',
            'role': 'trainer',
            'password1': 'pass12345Strong',
            'password2': 'pass12345Strong',
        })

        self.assertRedirects(response, reverse('login'))
        user = CustomUser.objects.get(email='trainer@example.com')
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(
            self.client.login(username='trainer@example.com', password='pass12345Strong')
        )

    def test_admin_registration_waits_for_approval_then_gets_staff_access(self):
        form = CustomUserCreationForm(data={
            'username': 'admin-request',
            'email': 'admin-request@example.com',
            'role': 'admin',
            'password1': 'pass12345Strong',
            'password2': 'pass12345Strong',
        })

        self.assertTrue(form.is_valid())
        user = form.save()
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_staff)

        user.is_active = True
        user.is_staff = user.role == 'admin'
        user.save(update_fields=['is_active', 'is_staff'])

        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
