"""
Custom management command: create_lms_admin
Usage: python manage.py create_lms_admin --email admin@lms.com --password secret123
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an LMS admin superuser'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--first-name', default='Admin')
        parser.add_argument('--last-name', default='User')

    def handle(self, *args, **options):
        email = options['email']
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User {email} already exists.'))
            return

        user = User.objects.create_superuser(
            email=email,
            password=options['password'],
            first_name=options['first_name'],
            last_name=options['last_name'],
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(
            f'✔ Admin user created: {user.email}'
        ))
