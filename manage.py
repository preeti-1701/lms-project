#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        import django
        from django.core.management import call_command, execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    if len(sys.argv) == 1:
        django.setup()
        call_command('migrate')
        call_command('seed_demo')
        call_command('runserver')
        return

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
