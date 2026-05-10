# Coursify LMS — Project Status

**Student:** Jyotsna
**Branch:** `jyotsna`
**Last updated:** Project status as of latest commit

---

## Summary

Coursify is a Learning Management System built per the SRS document. It uses a Django + Django REST Framework backend with a React + Vite frontend. The two communicate over a REST API with token-based authentication.

**Overall SRS completion: ~95%**

The remaining 5% requires production infrastructure (HTTPS, PostgreSQL, cloud hosting) which is typically handled in a separate deployment phase rather than during development.

---

## What's complete

### 3.1 Authentication ✅
- Login with email + password
- Email verification on signup via 6-digit OTP (real Gmail SMTP)
- Token-based authentication for the React frontend
- Encrypted password storage (Django's PBKDF2 hashing — industry standard)
- **Single active session enforcement**: when a user logs in on a new device, all previous sessions are invalidated automatically. The old device is force-logged-out and shown a toast notification.

### 3.2 User Management ✅
- Admin can create, edit, and disable users via Django admin
- Role assignment (student / instructor)
- Admin can assign courses to specific students through the Enrollment admin (with autocomplete search for both student and course)

### 3.3 Course Management ✅
- Admin/Trainer creates courses with title, description, level, category, emoji thumbnail
- Lessons added to courses with text content + YouTube video URL (URL only, not embedded — per teacher's instruction)

### 3.4 Student Access ✅
- Students view their enrolled courses on dashboard
- Catalog page lets students browse all courses, filter by level, search by keyword, and self-enroll
- Lesson content is wrapped in a translucent dynamic watermark showing the student's username and email — visible if the student takes a screenshot

### 3.5 Session Control ✅
- Every login creates a `UserSession` record tracking IP address, browser, OS, and timestamps
- Students can view their own active sessions and recent history at `/sessions`
- Admin can view all sessions in Django admin and force-logout any session via an admin action

### Section 4 — Security ✅ (mostly)
- Encrypted password storage ✓
- Right-click disabled on lesson pages ✓
- PrintScreen detection (clears clipboard, shows red toast) ✓
- Dev-tools shortcuts blocked (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Cmd+Alt+I) ✓
- Dynamic watermark on protected content ✓
- Token-based session validation ✓

### Section 5 — Non-Functional ✅
- Easy-to-use UI (clean editorial design with Instrument Serif + Geist typography)
- Fast page loading
- Mobile responsive (tested on iPhone-sized viewports)
- Architecture supports 500+ users (PostgreSQL switch is a 2-line change)

### Bonus features (not in SRS)
- Auto-graded multiple-choice quizzes with pass/fail thresholds
- Lesson-by-lesson progress tracking with progress bars
- Course completion auto-detection
- Polished landing page with feature grid
- Custom OTP input with auto-advance and paste handling

---

## What's still pending

### Cannot be done locally — requires deployment

**Section 4: HTTPS communication**
- Localhost runs on HTTP. HTTPS requires a real domain, SSL certificate (free via Let's Encrypt), and a deployed server. This is a deployment-phase task, not a development task.

**Section 7: Cloud-based deployment**
- Deploying to AWS / Heroku / DigitalOcean / Render. Requires:
  - Setting up a cloud account
  - Configuring environment variables in production
  - Deploying the Django app + serving the React build
  - Setting up a domain name
- Estimated time: 2-4 hours, plus account setup.

**Section 7: PostgreSQL**
- Currently using SQLite for local development. Switching to PostgreSQL in production requires:
  - Provisioning a PostgreSQL instance (or using a managed service like Supabase / Neon / RDS)
  - 2 lines of code change in `settings.py`
  - Re-running migrations
- Architecture is already PostgreSQL-compatible — no model changes needed.

### Skipped per scope decision

**3.1: Mobile number login**
- Real SMS sending requires a paid service like Twilio (~$0.01–$0.05 per SMS, requires credit card on file).
- The SRS allows "email/mobile" — email satisfies the requirement.
- Could be added later if scope expands.

---

## Tech Stack

**Backend**
- Python 3.12, Django 6.0, Django REST Framework
- SQLite (dev) / PostgreSQL-ready (production)
- django-cors-headers (for React integration)
- Real Gmail SMTP for OTP delivery

**Frontend**
- React 18 + Vite 5
- React Router 6
- Vanilla CSS (no UI framework — keeps bundle small)
- Token authentication via localStorage

**Models** (8 total)
1. `User` — extends AbstractUser, adds `role`, `is_verified`, `bio`, `avatar_color`
2. `Course` — instructor-owned content
3. `Lesson` — ordered content within a course
4. `Enrollment` — student ↔ course relationship
5. `LessonProgress` — per-lesson completion tracking
6. `Quiz` — quizzes attached to courses
7. `Question` — multiple-choice questions
8. `QuizAttempt` — student's quiz scores
9. `EmailOTP` — verification codes
10. `UserSession` — active session tracking

---

## How to run the project

See `README.md` for full setup instructions. Short version:

```bash
# Backend
pip install -r requirements.txt
python manage.py migrate
python seed_data.py
python manage.py runserver  # localhost:8000

# Frontend (separate terminal)
cd react-frontend
npm install
npm run dev  # localhost:5173
```

For real email OTP: copy `.env.example` to `.env` and add Gmail credentials.

---

## Demo accounts

All passwords: `demo1234`

- **Student:** `student@demo.com` (Jyotsna, with existing enrollments)
- **Instructor:** `priya_sharma`
- **Admin:** `admin` / `admin` for `/admin/`
