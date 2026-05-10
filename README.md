# Coursify — Learning Management System

Full-stack LMS built for the Python Backend internship at Newgen Softech. Django + DRF backend with a React + Vite frontend, role-based access (student / instructor / admin), real email OTP verification, single-session enforcement, content protection, and PDF certificate generation.

## 🏗 Architecture

```
                  ┌─────────────────────────────┐
                  │   Django Backend (:8000)    │
                  │  ├── 10+ Models             │
                  │  ├── REST API (/api/)       │
                  │  ├── Admin (/admin/)        │
                  │  ├── Gmail SMTP (OTP)       │
                  │  └── PDF Generator          │
                  └──────────────┬──────────────┘
                                 │ Token Auth + CORS
                                 │
                  ┌──────────────▼──────────────┐
                  │   React + Vite (:5173)      │
                  │  ├── Landing / Login        │
                  │  ├── Signup + OTP Verify    │
                  │  ├── Student Dashboard      │
                  │  ├── Catalog + Enroll       │
                  │  ├── Lesson + Watermark     │
                  │  ├── Quiz (auto-graded)     │
                  │  ├── Sessions (active list) │
                  │  ├── Instructor Console     │
                  │  └── PDF Certificate DL     │
                  └─────────────────────────────┘
```

## 🚀 Setup

### 1. Backend (port 8000)

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Gmail + app password (for sending OTPs)
python manage.py migrate
python seed_data.py
python manage.py runserver
```

### 2. Frontend (port 5173)

In a second terminal:

```bash
cd react-frontend
npm install
npm run dev
```

Open `http://localhost:5173/`

## 🔑 Demo Accounts (password: `demo1234`)

| Role | Login | Notes |
|---|---|---|
| Student | `student@demo.com` | Has enrollments + completed Git course (for certificate demo) |
| Student | `sara_mehta` | Just starting out |
| Instructor | `priya@newgen.com` | Owns 2 courses, can manage lessons + quizzes |
| Instructor | `rahul_verma` | Owns 2 courses |
| Instructor | `anita_iyer` | Owns 1 course |
| Admin | `admin` / `admin` | Full Django admin at `/admin/` |

## ✨ Features

### For Students

- **Email OTP signup** — real Gmail SMTP, 6-digit code with 10-min expiry
- **Catalog browsing** with search, level filter, category filter
- **Self-enrollment** in any published course
- **Lesson viewer** with sidebar nav, progress checkmarks, video URL link, watermark
- **Auto-graded quizzes** with score ring and pass/fail
- **Progress tracking** per lesson, persisted to localStorage + backend
- **PDF certificate** download when course is 100% complete
- **Active sessions page** showing devices + IPs + "this device" pill

### For Instructors

- **Auto-redirect** to `/instructor` console on login (role-based routing)
- **Stats dashboard** — courses, lessons, quizzes, enrolled students
- **Read-only course details** (admin manages courses)
- **Full CRUD on lessons & quizzes** within assigned courses
- **Quiz question editor** with green-pill correct answer marking
- **Cannot create courses** — only admin can (matches SRS workflow)

### For Admins

- **Clean admin** with proxy models — Students and Teachers as separate sections (filtered by role)
- **Assign courses** to students via Enrollment
- **Force-logout** any active user session (SRS 3.5)
- **Hidden tables** (EmailOTP, LessonProgress, QuizAttempt, Question) — only essential models surface

## 🔒 Security Features (SRS Section 4)

- **Email OTP verification** before account is activated
- **Token-based API auth** — DRF tokens in `Authorization: Token <key>` header
- **Single active session** — login deletes all old tokens, force-logged-out devices see toast
- **Admin force-logout** — tick session in admin → "Force-logout selected sessions" action
- **Per-user watermark** — username + email repeated diagonally across every lesson page
- **Right-click disabled** on lesson and quiz pages
- **Dev tools blocking** — F12, Cmd+Shift+I/J/C, Cmd+Alt+I/J/C, Ctrl+U, Ctrl+S
- **Copy/paste blocking** — Cmd/Ctrl+C, Cmd/Ctrl+A, Cmd/Ctrl+P, Cmd/Ctrl+S
- **Session tracking** — IP address, device label, user agent stored per session
- **Quiz answer protection** — correct answers excluded from API serializer
- **Course assignment by admin** — instructors can't self-assign courses

> Note on screenshot blocking: macOS captures Cmd+Shift+3/4/5/6 at the OS level before any browser can intercept the keypress — a known web platform limitation that affects Netflix, Disney+, and every web-based video service. Coursify mitigates this with deterrence (per-user watermark identifies the leaker) rather than prevention.

## 📡 REST API

### Auth
- `POST /api/signup/` — create unverified account, send OTP email
- `POST /api/verify-otp/` — verify OTP, activate account
- `POST /api/resend-otp/` — resend code
- `POST /api/login/` — email or username login → `{token, user}`
- `POST /api/logout/` — invalidate token
- `GET /api/me/` — current user + enrollments

### Content
- `GET /api/courses/` — list published courses
- `GET /api/courses/<slug>/` — detail with lessons + quizzes
- `POST /api/courses/<slug>/enroll/` — self-enroll
- `GET /api/quizzes/<id>/` — quiz (correct answers hidden)
- `POST /api/lesson/<id>/complete/` — mark lesson done
- `POST /api/quiz/<id>/submit/` — submit answers, returns score

### Sessions
- `GET /api/my-sessions/` — list active + recent sessions

### Certificate
- `GET /api/certificate/<course_slug>/` — download PDF (only if 100% complete)

### Instructor
- `GET /api/instructor/stats/` — course/lesson/quiz/student counts
- `GET /api/instructor/courses/` — assigned courses
- `GET|POST /api/instructor/courses/<slug>/lessons/` — list/create lessons
- `GET|PATCH|DELETE /api/instructor/lessons/<id>/`
- `GET|POST /api/instructor/courses/<slug>/quizzes/` — list/create quizzes
- `GET|PATCH|DELETE /api/instructor/quizzes/<id>/`

## 🛠 Tech Stack

- **Backend:** Python 3.12, Django 6.0, Django REST Framework 3.17, SQLite (dev / PostgreSQL-ready)
- **Email:** Gmail SMTP via app password
- **PDF:** reportlab 4 (landscape A4, custom layout)
- **Frontend:** React 18, Vite 5, React Router 6, vanilla CSS
- **Auth:** DRF Token + custom email-or-username auth backend
- **Fonts:** Instrument Serif (display) + Geist (body) + Geist Mono

## 📁 Project Structure

```
lms_project/
├── manage.py
├── db.sqlite3
├── seed_data.py
├── requirements.txt
├── .env.example          # template — copy to .env, never commit
├── README.md
├── DEMO_SCRIPT.md        # demo walkthrough
├── PROJECT_STATUS.md     # SRS coverage breakdown
├── lms_core/             # Django settings + root URLs
├── core/                 # main app
│   ├── models.py         # 10+ models incl. UserSession, EmailOTP
│   ├── views.py          # all API endpoints + cert generator
│   ├── serializers.py
│   ├── admin.py          # proxy models for Students/Teachers
│   ├── auth_backends.py  # email-or-username auth
│   ├── forms.py
│   ├── urls.py
│   └── migrations/
├── templates/            # Django HTML templates (v1, deprecated)
├── static/css/
└── react-frontend/       # React app (v2, primary)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx           # role-based routing, force-logout listener
        ├── main.jsx
        ├── styles.css
        ├── api/client.js     # API wrapper, token handling
        ├── hooks/
        │   └── useProtection.js   # right-click/dev-tools/copy block
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Signup.jsx
            ├── Dashboard.jsx
            ├── Catalog.jsx
            ├── CourseDetail.jsx
            ├── Lesson.jsx              # with watermark
            ├── Quiz.jsx
            ├── Sessions.jsx
            ├── InstructorDashboard.jsx
            └── InstructorCourseEditor.jsx
```

## 🧠 Key Design Decisions

- **Custom User model** with `role` field — Django docs strongly recommend defining this from day one
- **Proxy models for admin** — `Student` and `Teacher` filter the User table by role for clean UX
- **Email OR username login** via custom auth backend — better UX than forcing usernames
- **Email OTP via Gmail SMTP** — real verification, no fake "verified" flag
- **Single-session enforcement** — login deletes all prior tokens for the user, listener in App.jsx detects 401/403 and shows toast
- **Token auth** — React stores in localStorage, sends as `Authorization: Token <key>`
- **CourseDetailSerializer separate from list** — only detail includes full lessons (saves bandwidth)
- **Correct answers excluded from QuizSerializer** — prevents cheating via API inspection
- **CORS allowlist** — only `localhost:5173` in dev
- **`progress_percent` as model property** — computed from LessonProgress, never stale
- **PDF certificate** — generated on-demand with reportlab, unique cert ID via SHA256 hash, only available at 100% completion
- **Per-lesson localStorage caching** — completion state survives refresh, stays consistent across navigation
