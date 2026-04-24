from django.core.management.base import BaseCommand

from core.models import Course, Lesson, User


class Command(BaseCommand):
    help = 'Create demo LMS users, courses, assignments, and lessons.'

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@learnspace.local',
                'mobile': '9000000001',
                'role': User.Roles.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'System',
                'last_name': 'Admin',
            },
        )
        admin.set_password('Admin@123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.save()

        trainer, _ = User.objects.get_or_create(
            username='trainer',
            defaults={
                'email': 'trainer@learnspace.local',
                'mobile': '9000000002',
                'role': User.Roles.TRAINER,
                'first_name': 'Asha',
                'last_name': 'Trainer',
            },
        )
        trainer.set_password('Trainer@123')
        trainer.role = User.Roles.TRAINER
        trainer.is_active = True
        trainer.save()

        student, _ = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@learnspace.local',
                'mobile': '9000000003',
                'role': User.Roles.STUDENT,
                'first_name': 'Rohan',
                'last_name': 'Student',
            },
        )
        student.set_password('Student@123')
        student.role = User.Roles.STUDENT
        student.is_active = True
        student.save()

        course, _ = Course.objects.get_or_create(
            title='Student Success Orientation',
            defaults={
                'summary': 'A starter course for students covering study habits, platform expectations, and digital learning discipline.',
                'trainer': trainer,
                'cover_color': '#df6b57',
                'is_published': True,
            },
        )
        course.trainer = trainer
        course.students.add(student)
        course.save()

        Lesson.objects.get_or_create(
            course=course,
            order=1,
            title='Welcome to the LMS',
            defaults={
                'youtube_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'description': 'A demo protected YouTube lesson with dynamic student watermarking.',
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo data ready. Use admin@learnspace.local / Admin@123 to sign in.'))
