# 🎓 LearnSphere — Learning Management System

> A secure, role-based Learning Management System built with Django REST Framework and React. Designed for institutions to deliver structured video-based courses with full traceability and access control.

---

## 👩‍💻 Built By

**P J Rakshitha** —  2026

---

## 🌟 What Makes This Different

- 🔐 **Single-session enforcement** — Login from a new device automatically logs out the previous session
- 🎯 **Role-based access** — Three distinct portals for Admin, Trainer, and Student
- 🌊 **Dynamic watermark** — Every video session displays the student's email as a moving watermark for traceability
- 📊 **Real-time progress tracking** — Trainers see exactly which videos each student has watched and their completion percentage
- 🕵️ **Full audit trail** — Every login, logout, and video access is recorded with IP address and device info

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│              Client Layer                    │
│     React + Vite + Tailwind CSS             │
│  Admin Portal | Trainer Portal | Student     │
└──────────────────┬──────────────────────────┘
                   │ HTTPS + JWT
┌──────────────────▼──────────────────────────┐
│           Application Layer                  │
│         Django REST Framework               │
│  Auth | Courses | Progress | Audit          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Data Layer                      │
│              SQLite / PostgreSQL             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| State Management | TanStack React Query |
| Backend | Django 6, Django REST Framework |
| Authentication | JWT (SimpleJWT) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Version Control | Git + GitHub |

---

## 👥 User Roles

### 🔴 Admin
- Create and manage all users (Admin, Trainer, Student)
- Create courses and add YouTube videos
- Assign trainers to courses
- Enroll students in courses
- Force logout any user remotely
- View full audit logs

### 🟡 Trainer
- View courses assigned to them by admin
- See all enrolled students per course
- Track each student's video progress and completion percentage
- View which specific videos each student has or hasn't watched

### 🟢 Student
- View only courses assigned to them
- Watch videos (opens in YouTube)
- Progress automatically tracked on video access

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Password Storage | bcrypt hashing |
| Session Control | Single active session per user |
| Token Validation | JWT with 30-min expiry |
| Video Protection | Short-lived signed tokens |
| Watermarking | Dynamic position, shows email + timestamp |
| Right-click Block | Context menu disabled on video |
| Keyboard Block | PrintScreen and F12 intercepted |
| Audit Logging | IP, device, action recorded on every event |
| Force Logout | Admin can remotely invalidate any session |

---

## 📁 Project Structure

```
P_J_Rakshitha/
├── backend/                    # Django REST API
│   ├── accounts/               # Auth, Users, Sessions
│   │   ├── models.py           # CustomUser, UserSession
│   │   ├── views.py            # Login, Logout, ForceLogout
│   │   ├── serializers.py      # User serializers
│   │   ├── permissions.py      # IsAdmin, IsTrainer, IsStudent
│   │   └── middleware.py       # Single session enforcement
│   ├── courses/                # Course, Video, Progress
│   │   ├── models.py           # Course, CourseVideo, Assignment, VideoProgress
│   │   ├── views.py            # CRUD + Token + Progress APIs
│   │   └── serializers.py
│   ├── audit/                  # Activity logging
│   │   ├── models.py           # AuditLog
│   │   └── utils.py            # log_event() helper
│   └── lms_project/            # Django settings and URLs
└── frontend/                   # React Application
    └── src/
        ├── pages/
        │   ├── admin/          # AdminDashboard, UserMgmt, CourseMgmt, AuditLog
        │   ├── trainer/        # TrainerDashboard with progress view
        │   └── student/        # StudentDashboard with course list
        ├── components/
        │   ├── video/          # VideoPlayer, Watermark, SecurityWrapper
        │   └── layout/         # Navbar, ProtectedRoute
        ├── api/                # Axios instance + API functions
        ├── context/            # AuthContext
        └── utils/              # Token storage helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
cd P_J_Rakshitha/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-decouple

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd P_J_Rakshitha/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the App

| Portal | URL |
|--------|-----|
| Student / Trainer / Admin Login | http://localhost:5173 |
| Django Admin Panel | http://127.0.0.1:8000/admin |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/accounts/login/` | Public |
| POST | `/api/accounts/logout/` | Authenticated |
| POST | `/api/accounts/users/<id>/force-logout/` | Admin |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/accounts/users/` | Admin |
| POST | `/api/accounts/users/` | Admin |
| PUT | `/api/accounts/users/<id>/` | Admin |

### Courses
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/courses/` | Admin, Trainer |
| POST | `/api/courses/` | Admin, Trainer |
| GET | `/api/courses/my-courses/` | Student |
| GET | `/api/courses/trainer-courses/` | Trainer |
| POST | `/api/courses/<id>/videos/` | Admin, Trainer |
| GET | `/api/courses/video-token/<id>/` | Authenticated |
| GET | `/api/courses/<id>/progress/` | Admin, Trainer |
| POST | `/api/courses/mark-watched/<id>/` | Student |

### Audit
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/audit/logs/` | Admin |

---

## 📊 Database Schema

```
CustomUser          UserSession
----------          -----------
id (UUID)           id (UUID)
email               user_id (FK)
full_name           jwt_hash
mobile              ip_address
role                device_info
is_active           created_at
password_hash

Course              CourseVideo         CourseAssignment
------              -----------         ----------------
id (UUID)           id (UUID)           id (UUID)
title               course_id (FK)      course_id (FK)
description         title               student_id (FK)
created_by (FK)     youtube_video_id    assigned_by (FK)
trainer (FK)        order               assigned_at
is_active           added_at

VideoProgress       AuditLog
-------------       --------
id (UUID)           id (UUID)
student_id (FK)     user_id (FK)
video_id (FK)       action
watched             ip_address
watched_at          device_info
                    metadata
                    timestamp
```

---

## 🔄 How Single Session Works

```
Student logs in from Phone
        ↓
Server deletes all existing sessions for that user
        ↓
New JWT token generated + hash stored in UserSession table
        ↓
Student logs in from Laptop
        ↓
Phone session deleted → Phone gets 401 on next request
        ↓
Phone redirected to login page automatically
```

---


  <em>TapAcademy | 2026</em>
</div>
