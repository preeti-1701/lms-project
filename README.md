# Secure LMS Django Website

A simple Learning Management System built with Django, Bootstrap, SQLite for local development, and YouTube video embeds.

## Features

- Email, mobile, or username login
- One active session per user, with previous sessions logged out on new login
- Admin-managed roles: Admin, Trainer, Student
- Course, YouTube video, and enrollment management
- Admin assignment of trainers to specific courses
- Student dashboard for assigned courses only
- Trainer dashboard and video tools limited to assigned courses
- Trainers cannot create or self-assign courses; admins create/assign courses
- IP address and device tracking on login
- Admin force logout from Django admin
- Dynamic video watermark and browser-level deterrence for right-click/print shortcuts

## Run locally

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_demo_lms
.\.venv\Scripts\python.exe manage.py runserver
```

Then open http://127.0.0.1:8000/.

## Admin

Create an admin user with:

```powershell
.\.venv\Scripts\python.exe manage.py createsuperuser
```

Use Django admin to create users, set profile roles, disable accounts, assign students and trainers to courses, and force logout active sessions.

Demo accounts:

- Admin: `admin@example.com` / `Admin@12345`
- Trainer: `trainer@example.com` / `Trainer@12345`
- Student: `student@example.com` / `Student@12345`
- Student mobile login: `9999999999` / `Student@12345`
