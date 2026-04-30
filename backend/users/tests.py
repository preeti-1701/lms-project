from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Profile


class SignupAndApprovalTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.User = get_user_model()

	def _login(self, *, identifier: str, password: str) -> str:
		resp = self.client.post(
			'/api/auth/login/',
			{'identifier': identifier, 'password': password},
			format='json',
		)
		self.assertEqual(resp.status_code, 200)
		return resp.data['access']

	def test_student_can_signup_and_is_approved(self):
		resp = self.client.post(
			'/api/auth/signup/',
			{
				'role': 'student',
				'name': 'Student One',
				'email': 'student@example.com',
				'password': 'Passw0rd!',
			},
			format='json',
		)
		self.assertEqual(resp.status_code, 201)
		self.assertEqual(resp.data['role'], 'student')
		self.assertTrue(resp.data['approved'])

		user = self.User.objects.get(email='student@example.com')
		self.assertEqual(user.profile.role, Profile.ROLE_STUDENT)
		self.assertTrue(user.profile.is_approved)

	def test_trainer_signup_is_pending_until_admin_approves(self):
		# Create admin
		admin = self.User.objects.create(username='admin', email='admin@example.com', is_staff=True)
		admin.set_password('AdminPassw0rd!')
		admin.save(update_fields=['password'])
		Profile.objects.filter(user=admin).update(role=Profile.ROLE_ADMIN, is_approved=True)

		# Trainer signs up
		signup = self.client.post(
			'/api/auth/signup/',
			{
				'role': 'trainer',
				'name': 'Trainer One',
				'email': 'trainer@example.com',
				'password': 'Passw0rd!',
			},
			format='json',
		)
		self.assertEqual(signup.status_code, 201)
		self.assertEqual(signup.data['role'], 'trainer')
		self.assertFalse(signup.data['approved'])
		trainer_user_id = signup.data['id']

		trainer = self.User.objects.get(id=trainer_user_id)
		self.assertEqual(trainer.profile.role, Profile.ROLE_TRAINER)
		self.assertFalse(trainer.profile.is_approved)

		# Admin approves
		access = self._login(identifier='admin@example.com', password='AdminPassw0rd!')
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

		approve = self.client.post('/api/admin/trainers/approve/', {'user_id': trainer_user_id}, format='json')
		self.assertEqual(approve.status_code, 200)
		self.assertTrue(approve.data['approved'])

		trainer.refresh_from_db()
		self.assertTrue(trainer.profile.is_approved)
