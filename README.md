# Learning Management System (Django)

Simple LMS project built with Django.

## Features
- Role-based users: Admin, Trainer, Student
- Course management
- YouTube video lessons with brief detail
- Student access limited to assigned courses
- Single active session per user (auto logout previous)
- Admin panel for users, courses, videos, enrollments

## Tech
- Django 4.2
- SQLite (default for local setup)

## Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install django
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open:
- App: http://127.0.0.1:8000/
- Admin: http://127.0.0.1:8000/admin/

## How to use
1. Create users from Admin panel.
2. Set each user role in `Profile` (Admin/Trainer/Student).
3. Create courses and add video links.
4. Create enrollments to assign students to courses.
5. Login as each role to test access.
