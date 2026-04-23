# LMS — Django + DRF Learning Management System

A simple LMS with two roles (Admin/Instructor and Student), JWT-secured REST API, and a Bootstrap HTML frontend.

## Features

- User registration, login, logout (Django session for HTML pages, JWT for API)
- Two roles: **Admin** (instructor) and **Student**
- Admins can create, update, and delete courses (title, description, video URL)
- Students can browse courses, enroll, and track enrolled courses on their dashboard
- Unique enrollment (a user cannot enroll in the same course twice)
- Full REST API under `/api/`

## Tech Stack

- Django 5 + Django REST Framework
- PostgreSQL (via `DATABASE_URL`)
- JWT auth (`djangorestframework-simplejwt`)
- Bootstrap 5 (CDN)

## Project Structure

```
lms/
├── manage.py
├── requirements.txt
├── lms_project/        # Django project (settings, urls, wsgi)
├── accounts/           # Custom user model + auth (HTML + API)
├── courses/            # Courses + Enrollments (HTML + API)
├── templates/          # Bootstrap HTML pages
└── static/css/         # Custom styles
```

## Run Locally

1. **Install Python 3.11+ and PostgreSQL**, then create a database.
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set environment variables:**
   ```bash
   export DATABASE_URL=postgres://USER:PASS@HOST:5432/DBNAME
   export SESSION_SECRET=some-random-string
   ```
4. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```
5. **Create a superuser (optional, to use Django admin):**
   ```bash
   python manage.py createsuperuser
   ```
6. **Run the dev server:**
   ```bash
   python manage.py runserver 0.0.0.0:5000
   ```
7. Open <http://localhost:5000>.

## REST API

All API endpoints live under `/api/`. Authenticated endpoints require a JWT access token in the
`Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint              | Description                                    |
| ------ | --------------------- | ---------------------------------------------- |
| POST   | `/api/auth/register/` | Create account. Body: `username, email, password, role` |
| POST   | `/api/auth/login/`    | Get access + refresh tokens                    |
| POST   | `/api/auth/refresh/`  | Refresh access token                           |
| POST   | `/api/auth/logout/`   | Logout (acknowledgement)                       |
| GET    | `/api/auth/me/`       | Current user profile                           |

### Courses

| Method | Endpoint                         | Who               | Description             |
| ------ | -------------------------------- | ----------------- | ----------------------- |
| GET    | `/api/courses/`                  | Auth users        | List all courses        |
| POST   | `/api/courses/`                  | Admin only        | Create a course         |
| GET    | `/api/courses/<id>/`             | Auth users        | Course detail           |
| PUT/PATCH | `/api/courses/<id>/`          | Admin only        | Update a course         |
| DELETE | `/api/courses/<id>/`             | Admin only        | Delete a course         |
| POST   | `/api/courses/<id>/enroll/`      | Any auth user     | Enroll current user     |
| GET    | `/api/courses/my/enrollments/`   | Any auth user     | Current user's enrollments |

### Example

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"a@x.com","password":"secret123","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Create course (use access token from login)
curl -X POST http://localhost:5000/api/courses/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Intro to Django","description":"Learn Django","video_url":"https://youtube.com/..."}'
```

## HTML Pages

| Path                  | Description              |
| --------------------- | ------------------------ |
| `/`                   | Home                     |
| `/register/`          | Register                 |
| `/login/`             | Login                    |
| `/logout/`            | Logout                   |
| `/courses/`           | Browse all courses       |
| `/courses/<id>/`      | Course detail + enroll   |
| `/dashboard/`         | Role-aware dashboard     |
| `/admin/`             | Django admin             |

## Notes

- JWT settings (`ACCESS_TOKEN_LIFETIME`, etc.) are in `lms_project/settings.py` under `SIMPLE_JWT`.
- `AUTH_USER_MODEL = 'accounts.User'` adds the `role` field on the user.
- The unique constraint `unique_together = ('student', 'course')` on `Enrollment` enforces unique enrollment.
