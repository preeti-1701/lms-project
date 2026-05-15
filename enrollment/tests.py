from django.test import TestCase
from django.urls import reverse

from courses.models import Course
from users.models import CustomUser
from .models import Enrollment


class EnrollmentRequestFlowTests(TestCase):
    def setUp(self):
        self.trainer = CustomUser.objects.create_user(
            username='trainer',
            email='trainer@example.com',
            password='pass12345',
            role='trainer',
        )
        self.student = CustomUser.objects.create_user(
            username='student',
            email='student@example.com',
            password='pass12345',
            role='student',
        )
        self.course = Course.objects.create(
            title='Python Basics',
            description='Learn Python from scratch.',
            trainer=self.trainer,
            is_approved=True,
        )

    def test_student_request_requires_trainer_approval(self):
        self.client.force_login(self.student)

        response = self.client.post(reverse('enroll_course', args=[self.course.id]))

        self.assertRedirects(response, reverse('course_detail', args=[self.course.id]))
        enrollment = Enrollment.objects.get(student=self.student, course=self.course)
        self.assertEqual(enrollment.status, Enrollment.STATUS_PENDING)

    def test_trainer_can_approve_own_course_request(self):
        enrollment = Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_login(self.trainer)

        response = self.client.post(
            reverse('review_enrollment', args=[enrollment.id, 'approve'])
        )

        self.assertRedirects(response, reverse('dashboard:trainer_dashboard'))
        enrollment.refresh_from_db()
        self.assertEqual(enrollment.status, Enrollment.STATUS_APPROVED)
        self.assertIsNotNone(enrollment.reviewed_at)
