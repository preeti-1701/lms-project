# Learning Management System (LMS)

A full-stack Learning Management System built with Django, Django Templates, and session-based authentication.

## Features

- **Three Roles**: Admin, Trainer, Student
- **Custom User Model**: Extends AbstractUser with a `role` field
- **Session-based Authentication**: Login/logout with role-based redirection
- **Course Management**: Create, update, delete courses with auto-generated IDs (CRS001 format)
- **Lesson Management**: Add YouTube embed videos to courses
- **Enrollment System**: Students can enroll and access course content
- **Video Protection**: Embedded YouTube videos with disabled right-click and keyboard shortcut prevention
- **Search & Pagination**: Search courses by title or ID, paginated listings
- **Version Tracking**: Track course versions
- **Responsive UI**: Built with Bootstrap 5

## Project Structure

```
LMS/
├── core/
│   ├── migrations/
│   ├── templates/core/
│   │   ├── base.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── admin_dashboard.html
│   │   ├── trainer_dashboard.html
│   │   ├── student_dashboard.html
│   │   ├── course_list.html
│   │   ├── course_detail.html
│   │   ├── video_player.html
│   │   ├── course_form.html
│   │   ├── lesson_form.html
│   │   ├── user_form.html
│   │   ├── manage_users.html
│   │   ├── confirm_delete.html
│   │   └── enrollments.html
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── decorators.py
│   ├── forms.py
│   ├── models.py
│   ├── urls.py
│   └── views.py
├── lms_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── video_protect.js
├── manage.py
├── db.sqlite3
└── README.md
```

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Django 6.0+

### 2. Install Dependencies (if needed)
```bash
pip install django
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Admin User
```bash
python manage.py createsuperuser
```
When prompted, set:
- Username: `admin`
- Email: `admin@example.com`
- Password: your password

Then set the role to `admin` via the Django shell or admin panel:
```bash
python manage.py shell
```
```python
from core.models import User
u = User.objects.get(username='admin')
u.role = 'admin'
u.save()
exit()
```

Alternatively, you can register as a student via the web interface and change the role in the Django Admin at `/admin/`.

### 5. Run the Development Server
```bash
python manage.py runserver
```

### 6. Access the Application
- Open your browser to: `http://127.0.0.1:8000/`

## Role-Based Access

### Admin
- Full access to manage users, courses, lessons, and enrollments
- Dashboard: `/admin-dashboard/`
- Can create trainers and students
- Can assign trainers to courses

### Trainer
- Can view and manage only their assigned courses
- Can add/edit lessons with YouTube embed links
- Dashboard: `/trainer-dashboard/`

### Student
- Can browse all courses
- Can enroll in courses
- Can watch videos only for enrolled courses
- Dashboard: `/student-dashboard/`

## Video Handling
- Only YouTube embed URLs are accepted (e.g., `https://www.youtube.com/embed/VIDEO_ID`)
- Videos are displayed in an iframe with right-click disabled
- Keyboard shortcuts (F12, Ctrl+U, Ctrl+S) are blocked
- Students cannot navigate to YouTube directly from the player

## Search & Pagination
- Search courses by title or course ID on the course list page
- Results are paginated (6 courses per page)

## Notes
- The custom User model (`core.User`) is configured in `settings.py` via `AUTH_USER_MODEL`
- Default registration creates users with the `student` role
- Course IDs are auto-generated in the format `CRS001`, `CRS002`, etc.

