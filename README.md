# LearnSpace LMS

A Django-based Learning Management System built from the SRS requirements.

## Features

- Email, mobile, or username login with encrypted Django passwords.
- Admin, Trainer, and Student roles.
- One active session per user, with previous-session auto logout.
- IP address and device/user-agent tracking.
- Admin user creation, editing, disabling, and force logout.
- Course creation, trainer assignment, student assignment, and YouTube lesson management.
- Student-only access to assigned published courses.
- Protected video page with dynamic watermark plus right-click/print/save/source deterrence.
- Responsive UI for desktop and mobile.

## Run Locally

```powershell
python -m pip install -r requirements.txt
python manage.py
```

Open `http://127.0.0.1:8000/`.

`python manage.py` now runs `migrate`, `seed_demo`, and then starts the development server. You can still use normal Django commands like `python manage.py createsuperuser` or `python manage.py runserver 0.0.0.0:8000`.

## Demo Accounts

| Role | Login | Password |
| --- | --- | --- |
| Admin | admin@learnspace.local | Admin@123 |
| Trainer | trainer@learnspace.local | Trainer@123 |
| Student | student@learnspace.local | Student@123 |

## Notes

The SRS asks for download/share prevention and Print Screen blocking. Browser-based systems cannot completely prevent screen recording, screenshots, or camera capture, so this implementation focuses on deterrence and traceability with no-cookie YouTube embeds, disabled context menu/shortcut actions, and visible per-user watermarking.

For production, set `DJANGO_DEBUG=False`, provide `DJANGO_SECRET_KEY`, configure `DJANGO_ALLOWED_HOSTS`, and enable the HTTPS-related settings through the `DJANGO_SECURE_*`, `DJANGO_SESSION_COOKIE_SECURE`, and `DJANGO_CSRF_COOKIE_SECURE` environment variables.
