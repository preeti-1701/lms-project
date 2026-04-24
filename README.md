# Coursify — Learning Management System

Full-stack LMS built for the Python Backend internship at Coursify.
Django + DRF backend with both a **server-rendered template frontend** (v1) and a **React + Vite frontend** (v2) consuming the same REST API.

## 🏗 Architecture

```
                  ┌─────────────────────────────┐
                  │    Django Backend (:8000)   │
                  │  ├── Models (8)             │
                  │  ├── REST API (/api/)       │
                  │  ├── Admin (/admin/)        │
                  │  └── Django Templates (HTML)│
                  └──────────────┬──────────────┘
                                 │ Token Auth
                                 │ JSON over CORS
                  ┌──────────────▼──────────────┐
                  │  React + Vite (:5173)       │
                  │  ├── Login                  │
                  │  ├── Dashboard              │
                  │  ├── Course Detail          │
                  │  ├── Lesson + Video Player  │
                  │  └── Quiz                   │
                  └─────────────────────────────┘
```

## 🚀 Setup

### 1. Django backend (port 8000)

```bash
pip install -r requirements.txt
python manage.py migrate
python seed_data.py   # optional re-seed
python manage.py runserver
```

Runs at **http://127.0.0.1:8000/** — HTML templates + REST API.

### 2. React frontend (port 5173)

**Open a SECOND terminal window** (keep the Django one running):

```bash
cd react-frontend
npm install
npm run dev
```

Runs at **http://localhost:5173/**

## 🔑 Demo Accounts (password: `demo1234`)

- **Student:** `student_demo` (= Jyotsna, has enrollments + progress)
- **Instructor:** `priya_sharma`
- **Admin:** `admin` / `admin` for `/admin/`

## 📡 REST API

**Auth**
- `POST /api/login/` → `{token, user}`
- `GET /api/me/` → current user + enrollments

**Content**
- `GET /api/courses/` — list
- `GET /api/courses/<slug>/` — detail with lessons + quizzes
- `GET /api/quizzes/<id>/` — quiz (correct answers hidden)

**Actions**
- `POST /api/courses/<slug>/enroll/`
- `POST /api/lesson/<id>/complete/`
- `POST /api/quiz/<id>/submit/` with `{answers: {question_id: "A"}}`

## 🔒 Security Features (SRS Section 4)

On both Django and React lesson pages:
- Right-click disabled, dev tools shortcuts blocked (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Cmd+Alt+I)
- PrintScreen detection → clears clipboard, shows red toast
- Animated watermark on video with student's username + email (moves around so it can't be cropped)
- "Licensed to X" notice bar below video
- Text selection disabled
- Token-based API auth

## 🛠 Tech Stack

**Backend:** Python 3.12, Django 6.0, DRF 3.17, SQLite (dev), django-cors-headers
**Frontend v1:** Django templates + vanilla JS
**Frontend v2:** React 18 + Vite 5 + React Router 6
**Fonts:** Fraunces + Inter (Django), Instrument Serif + Geist (React)

## 📁 Project Structure

```
lms_project/
├── manage.py
├── db.sqlite3
├── seed_data.py
├── requirements.txt
├── DEMO_SCRIPT.md
├── README.md
├── lms_core/               Django config
├── core/                   main Django app (models, views, serializers, urls)
├── templates/              Django templates (v1)
├── static/css/             CSS for Django (v1)
└── react-frontend/         React + Vite (v2)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles.css
        ├── api/client.js
        └── pages/{Login,Dashboard,CourseDetail,Lesson,Quiz}.jsx
```

## 🧠 Key Design Decisions

- **Custom User model** with `role` field for student/instructor.
- **Token auth on API** — React stores token in localStorage, sends as `Authorization: Token <key>`.
- **`CourseDetailSerializer`** separate from list — only detail includes full lessons/quizzes (saves bandwidth).
- **Correct answers excluded** from Question serializer — prevents cheating via API inspection.
- **CORS allowlist** — only localhost:5173 allowed in dev.
- **`progress_percent` as property** — computed from LessonProgress, never stale.
