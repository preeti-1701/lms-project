"""Management command: create demo users (admin/trainer/student)."""
from django.core.management.base import BaseCommand
from core.models import User, Course, CourseVideo, CourseAssignment


class Command(BaseCommand):
    help = "Create demo admin/trainer/student users and a sample course."

    def handle(self, *args, **opts):
        # Admin
        admin, c = User.objects.get_or_create(
            username='admin', defaults={'email': 'admin@lms.local', 'role': User.ROLE_ADMIN,
                                        'is_staff': True, 'is_superuser': True})
        if c:
            admin.set_password('admin123'); admin.role = User.ROLE_ADMIN; admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin / admin123"))

        # Trainer
        trainer, c = User.objects.get_or_create(
            username='trainer', defaults={'email': 'trainer@lms.local', 'role': User.ROLE_TRAINER})
        if c:
            trainer.set_password('trainer123'); trainer.save()
            self.stdout.write(self.style.SUCCESS("Created trainer / trainer123"))

        # Student
        student, c = User.objects.get_or_create(
            username='student', defaults={'email': 'student@lms.local', 'role': User.ROLE_STUDENT})
        if c:
            student.set_password('student123'); student.save()
            self.stdout.write(self.style.SUCCESS("Created student / student123"))

        # Sample course + video
        course, c = Course.objects.get_or_create(
            title='Introduction to Python',
            defaults={'description': 'Learn the basics of Python programming.',
                      'created_by': trainer})
        if c:
            CourseVideo.objects.create(
                course=course, title='Welcome to Python', position=1,
                youtube_url='https://www.youtube.com/watch?v=_uQrJ0TkZlc')
            CourseAssignment.objects.get_or_create(student=student, course=course)
            self.stdout.write(self.style.SUCCESS("Created sample course + assignment"))

        self.stdout.write(self.style.SUCCESS("Done. Login at /login/"))
