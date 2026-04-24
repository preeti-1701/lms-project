# 🎬 DEMO SCRIPT — Read this before your demo

## Before the demo starts (10 min prep)

**Open TWO terminal windows.**

**Terminal 1 — Django:**
```
cd ~/Desktop/"lms project"/lms_project
python manage.py runserver
```
Leaves Django running on http://127.0.0.1:8000/

**Terminal 2 — React:**
```
cd ~/Desktop/"lms project"/lms_project/react-frontend
npm install     # only first time, takes 1 min
npm run dev
```
React runs on http://localhost:5173/

**Browser tabs to have open:**
1. http://127.0.0.1:8000/ — Django template version (v1)
2. http://localhost:5173/ — React version (v2)
3. http://127.0.0.1:8000/api/courses/ — DRF browsable API
4. http://127.0.0.1:8000/admin/ — Django admin (log in as `admin` / `admin`)

**Read through `core/models.py`, `core/views.py`, and `react-frontend/src/api/client.js` one more time.** You need to be able to explain them.

---

## The demo flow (~12-15 min)

### 1. Open with architecture (1 min)
> "I've built Coursify — a Learning Management System with a Python backend and two different frontends consuming the same REST API. Let me walk through it."

Draw or describe the architecture verbally:
> "The backend is Django with Django REST Framework, serving a REST API. On top of that I built two frontends: version 1 uses Django templates (server-rendered HTML), version 2 is a React app with Vite, using token authentication to hit the same API."

### 2. Landing + catalog — Django v1 (1 min)
Go to http://127.0.0.1:8000/. Walk through:
- Landing page stats (live from DB)
- Click **Catalog** — show filtering by level, category, search (Django Q objects)

### 3. Student flow in Django (3 min)
Log in as **student_demo / demo1234**.

Dashboard:
> "Role-aware dashboard. Students see enrollments and progress. Instructors see their courses and student counts."

Click a course in progress → course detail.
Click a lesson → lesson viewer.

**Demo the security features** (this directly addresses SRS Section 4):
- Try to right-click → red notice "Right-click is disabled to protect course content"
- Try F12 → same block
- Point at the moving watermark on the video: "That's a dynamic watermark with the student's username and email. It animates so it can't be cropped out of screen recordings."
- Point at the "licensed to student_demo" notice below the video

Click **Mark complete** — progress bar updates via AJAX without reload.

### 4. Take a quiz (1 min)
Go back to course detail, click a quiz.
Answer a few questions, submit. Show the result page with score ring.
> "Quizzes are auto-graded. Correct answers are stored server-side and deliberately excluded from the API response so students can't inspect the JSON and cheat."

### 5. Switch to React frontend (3-4 min) 🌟
Switch to http://localhost:5173/ tab.
> "Now the same backend, consumed by a React frontend. This proves the architecture — I can swap frontends without touching the backend. In production we'd deprecate v1 entirely."

- Log in with same credentials (`student_demo` / `demo1234`)
- Show **token auth**: open DevTools → Application → Local Storage → point at `coursify_token`
> "This is a DRF token. Every subsequent API call sends it in the Authorization header."

- Click through dashboard → course → lesson → quiz
- Show that **security features work in React too** (watermark, right-click block)
- Take the quiz in React, show the result

> "The same user, same data, same auto-grading — but a completely different frontend architecture. The Django version is server-rendered; the React version is a single-page app talking to the API."

### 6. REST API demo (2 min)
Open http://127.0.0.1:8000/api/courses/
> "DRF's browsable API. Everything the frontends do is also available as a REST API."

Click into a course → show nested lessons and quizzes.
Go to `/api/quizzes/5/` → point at questions:
> "Notice correct_answer is NOT in the response. That's intentional — students can't inspect the JSON to cheat."

### 7. Django admin (1 min)
Go to http://127.0.0.1:8000/admin/
> "Django's built-in admin. I customized it with inline editing — courses show their lessons inline, quizzes show their questions inline."

### 8. Close (30 sec)
> "That's Coursify — two frontends, one backend, one data model. Happy to go deeper on any part of the code."

---

## 🔥 Questions they might ask

**Q: Why two frontends?**
> Initially I built v1 (Django templates) to nail the backend end-to-end without worrying about a separate frontend build. Once the API was solid, I built v2 (React) to prove the architecture supports a decoupled client. In production I'd ship v2 and deprecate v1.

**Q: Why Django over Flask/FastAPI?**
> Django ships with ORM, admin, auth, migrations. For an LMS with users, roles, and heavy CRUD, it's a faster path to production. DRF gives us the REST layer without extra plumbing.

**Q: Why a custom User model?**
> Django docs strongly recommend this from day one — migrating to a custom User later is painful. I needed a `role` field to distinguish students and instructors.

**Q: How does React auth work?**
> On login, React calls `/api/login/` and receives a DRF token. It stores it in localStorage. Every subsequent API call sends `Authorization: Token <key>` in the header. DRF's TokenAuthentication class validates it.

**Q: Why CORS?**
> React runs on port 5173, Django on 8000 — different origins, so browsers block the cross-origin requests by default. `django-cors-headers` allowlists localhost:5173 explicitly. In production, the allowlist would be the real frontend domain.

**Q: Scaling?**
> SQLite → PostgreSQL (2-line change in settings). Add Redis for sessions and query caching. Serve static files via WhiteNoise or S3. Run Django under Gunicorn behind Nginx. React goes to Vercel or a CDN. Quiz grading stays server-side — if it got complex, move to Celery.

**Q: Security?**
> Passwords: Django's PBKDF2 hashing by default. CSRF on all forms. Quiz correct answers excluded from serializer. Token auth for API. Custom `IsInstructorOrReadOnly` permission class on write endpoints. For video content: dynamic watermark, right-click block, dev-tools shortcuts blocked, PrintScreen detection. SRS acknowledges full screen-recording prevention isn't possible — these are deterrence + traceability.

**Q: What's missing / next?**
> Email verification on signup. Instructor edit views (I only built create). HTTPS + production deploy. Celery workers for background tasks. Course categories as a real model instead of a string. Dark/light theme toggle. More test coverage.

**Q: Does the SRS tech stack match?**
> SRS says React + Node/Django + PostgreSQL. I went with Django (SRS offered the choice) + SQLite for local dev (PostgreSQL-ready). The React frontend is here. So 3 of 4 match. For tomorrow's deployment, swapping to PostgreSQL is a config change.

---

## ⚠️ If something breaks live

- **Django won't start**: `pip install -r requirements.txt` then `python manage.py migrate`
- **React won't start**: `cd react-frontend && npm install`
- **"Can't log in" on React**: check Django is running on port 8000. React's `src/api/client.js` expects `BASE = 'http://127.0.0.1:8000'`.
- **CORS errors in browser console**: make sure both Django AND React are running. CORS is configured in `lms_core/settings.py`.
- **Database empty**: `python seed_data.py`
- **Styles broken**: hard refresh with `Cmd + Shift + R` (Safari: Develop → Empty Caches)
- **Port already in use**: something else is running on 8000 or 5173 — close it or use `python manage.py runserver 8001` and update the React BASE URL
