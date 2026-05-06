# LearnHub — Django LMS

A simple, secure Learning Management System built with Django. Mirrors the React/Lovable
prototype: role-based access (admin / trainer / student), YouTube-hosted course videos,
per-student course assignments, and a secure video player with dynamic watermark.

## Features

- Email + password authentication (Django auth)
- Roles: **admin**, **trainer**, **student** (stored in a separate `Role` table — no
  privilege fields on the user/profile)
- Courses with ordered YouTube videos
- Per-student course assignments — students only see videos for assigned courses
- Secure player: `youtube-nocookie` embed, disabled right-click & text selection,
  dynamic watermark overlay with the viewer's email
- Admin dashboard for managing users, roles, courses, videos, and assignments
- Clean indigo/blue UI with responsive layout

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # then edit DJANGO_SECRET_KEY
python manage.py migrate
python manage.py createsuperuser    # this account becomes admin automatically
python manage.py runserver
```

Open http://127.0.0.1:8000

The first `createsuperuser` is auto-granted the `admin` role. Any new account
created via the signup page is granted the `student` role. Admins can change
roles and enable/disable accounts from **Manage › Users**.

## Project layout

```
lms_project/        # Django settings, root urls, wsgi/asgi
core/               # App: models, views, forms, templates, urls
templates/          # Shared base + auth templates
static/css/         # Indigo theme stylesheet
```

## Notes on security

- Roles live in a dedicated `Role` model (one row per user/role). Permission
  checks use `user.has_role("admin")` etc., never a flag on the user object.
- The video player applies CSS `user-select: none`, disables the context menu,
  and overlays a watermark with the current user's email. Complete prevention
  of screen recording is not possible — these measures are deterrents.
- For production: set `DJANGO_DEBUG=False`, configure `ALLOWED_HOSTS`, serve
  static files via `collectstatic`, and put Django behind HTTPS.
