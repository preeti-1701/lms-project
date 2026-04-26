# LMS — Learning Management System
### Django + DRF Backend — Full API Reference & Setup Guide

---

## Project Structure

```
lms_project/
├── config/
│   ├── settings.py          # All Django settings
│   ├── urls.py              # Root URL configuration
│   └── wsgi.py
├── apps/
│   ├── users/               # Custom user model, auth, RBAC
│   │   ├── models.py        # User model (email/mobile, roles)
│   │   ├── serializers.py   # JWT + user serializers
│   │   ├── views.py         # Auth + user management views
│   │   ├── permissions.py   # IsAdmin, IsTrainer, IsStudent, RBAC
│   │   ├── admin.py         # Admin panel: users, roles, force logout
│   │   ├── exceptions.py    # Custom error handler
│   │   └── urls/
│   │       ├── auth_urls.py
│   │       └── user_urls.py
│   ├── courses/             # Courses, videos, enrollments
│   │   ├── models.py        # Course, Video, Enrollment, VideoProgress
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── admin.py         # Admin panel: courses, videos, enrollments
│   │   └── urls.py
│   └── sessions/            # Session tracking & enforcement
│       ├── models.py        # UserSession (IP, device, active flag)
│       ├── middleware.py    # Single-session + activity tracking
│       ├── views.py         # Session management API
│       ├── admin.py         # Admin panel: sessions, force logout
│       └── urls.py
├── requirements.txt
├── .env.example
└── manage.py
```

---

## Quick Start

```bash
# 1. Clone and set up environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials, secret key, etc.

# 3. Apply migrations
python manage.py makemigrations users courses sessions
python manage.py migrate

# 4. Create admin user
python manage.py create_lms_admin \
    --email admin@yourlms.com \
    --password YourSecurePassword123 \
    --first-name Admin \
    --last-name User

# 5. Collect static files
python manage.py collectstatic --noinput

# 6. Run development server
python manage.py runserver

# 7. Access admin panel
# http://localhost:8000/admin/

# 8. View API docs
# http://localhost:8000/api/docs/        (Swagger UI)
# http://localhost:8000/api/redoc/       (ReDoc)
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login/` | Login (email/mobile + password) | No |
| POST | `/api/v1/auth/logout/` | Logout + blacklist token | Yes |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token | No (refresh token) |

**Login Request:**
```json
POST /api/v1/auth/login/
{
  "email": "student@example.com",   // or mobile: "9876543210"
  "password": "YourPassword123"
}
```

**Login Response:**
```json
{
  "refresh": "eyJ0eXAiOi...",
  "access": "eyJ0eXAiOi...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null
  }
}
```

**All subsequent requests:** Add header:
```
Authorization: Bearer <access_token>
```

---

### User Management (Admin Only)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/users/` | List all users | Admin |
| POST | `/api/v1/users/` | Create user | Admin |
| GET | `/api/v1/users/{id}/` | User detail | Admin / Self |
| PATCH | `/api/v1/users/{id}/` | Update user | Admin |
| DELETE | `/api/v1/users/{id}/` | Delete user | Admin |
| GET | `/api/v1/users/me/` | My profile | All |
| PATCH | `/api/v1/users/update_profile/` | Update own profile | All |
| POST | `/api/v1/users/change_password/` | Change password | All |
| POST | `/api/v1/users/{id}/reset_password/` | Admin reset password | Admin |
| POST | `/api/v1/users/{id}/toggle_active/` | Enable/disable account | Admin |
| POST | `/api/v1/users/{id}/force_logout/` | Force user logout | Admin |

**Create User:**
```json
POST /api/v1/users/
{
  "email": "trainer@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "trainer",               // "admin" | "trainer" | "student"
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "mobile": "9876543210"           // optional
}
```

**Query Filters:**
```
GET /api/v1/users/?role=student&is_active=true
GET /api/v1/users/?search=john
```

---

### Course Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/courses/` | List courses (filtered by role) | All |
| POST | `/api/v1/courses/` | Create course | Admin, Trainer |
| GET | `/api/v1/courses/{id}/` | Course detail | All (enrolled) |
| PATCH | `/api/v1/courses/{id}/` | Update course | Admin, Trainer |
| DELETE | `/api/v1/courses/{id}/` | Delete course | Admin, Trainer |
| GET | `/api/v1/courses/{id}/videos/` | List course videos | All (enrolled) |
| GET | `/api/v1/courses/{id}/my_progress/` | My progress | Student |

**Create Course:**
```json
POST /api/v1/courses/
{
  "title": "Python for Beginners",
  "description": "Learn Python from scratch",
  "status": "draft"   // "draft" | "published" | "archived"
}
```

**Query Filters:**
```
GET /api/v1/courses/?status=published
GET /api/v1/courses/?search=python
```

---

### Video Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/courses/{course_id}/videos/` | List videos | All (enrolled) |
| POST | `/api/v1/courses/{course_id}/videos/` | Add video | Admin, Trainer |
| GET | `/api/v1/courses/{course_id}/videos/{id}/` | Video detail | All (enrolled) |
| PUT/PATCH | `/api/v1/courses/{course_id}/videos/{id}/` | Update video | Admin, Trainer |
| DELETE | `/api/v1/courses/{course_id}/videos/{id}/` | Delete video | Admin, Trainer |

**Add Video:**
```json
POST /api/v1/courses/{course_id}/videos/
{
  "title": "Introduction to Variables",
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "order": 1,
  "duration_minutes": 15,
  "description": "Learn about Python variables"
}
```

**Video Response (students only get embed URL, never direct link):**
```json
{
  "id": "uuid",
  "title": "Introduction to Variables",
  "embed_url": "https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1",
  "thumbnail_url": "https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg",
  "order": 1,
  "duration_minutes": 15
}
```

---

### Enrollment Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/courses/enrollments/` | List enrollments | Admin/Trainer (all), Student (own) |
| POST | `/api/v1/courses/enrollments/` | Enroll student | Admin, Trainer |
| DELETE | `/api/v1/courses/enrollments/{id}/` | Remove enrollment | Admin, Trainer |
| POST | `/api/v1/courses/enrollments/bulk_enroll/` | Bulk enroll | Admin, Trainer |
| POST | `/api/v1/courses/enrollments/{id}/revoke/` | Revoke enrollment | Admin, Trainer |

**Enroll Student:**
```json
POST /api/v1/courses/enrollments/
{
  "user": "student-uuid",
  "course": "course-uuid",
  "expires_at": "2025-12-31T23:59:59Z"   // optional
}
```

**Bulk Enroll:**
```json
POST /api/v1/courses/enrollments/bulk_enroll/
{
  "course_id": "course-uuid",
  "user_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

### Session Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/sessions/` | All sessions | Admin |
| GET | `/api/v1/sessions/my/` | My sessions | All |
| POST | `/api/v1/sessions/force-logout/{user_id}/` | Force logout user | Admin |
| POST | `/api/v1/sessions/{session_id}/terminate/` | End specific session | Admin |

---

## Role-Based Access Matrix

| Feature | Admin | Trainer | Student |
|---------|-------|---------|---------|
| Create/edit users | ✔ | ✗ | ✗ |
| Assign roles | ✔ | ✗ | ✗ |
| Disable accounts | ✔ | ✗ | ✗ |
| Force logout users | ✔ | ✗ | ✗ |
| View all sessions | ✔ | ✗ | ✗ |
| Create courses | ✔ | ✔ | ✗ |
| Add videos to courses | ✔ | ✔ (own) | ✗ |
| Enroll students | ✔ | ✔ | ✗ |
| View enrolled courses | ✔ | ✔ (own) | ✔ (enrolled only) |
| View videos | ✔ | ✔ | ✔ (enrolled only) |
| Download videos | ✗ | ✗ | ✗ |
| Change own password | ✔ | ✔ | ✔ |

---

## Security Features

### 1. Password Security
- Django PBKDF2 hashing (300,000 iterations)
- Password strength validation enforced
- Old password required for self-change

### 2. JWT Token Security
- Short-lived access tokens (60 min, configurable)
- Refresh token rotation + blacklisting on every use
- Token blacklist checked on logout
- Custom claims: role, name injected into token

### 3. Single Session Enforcement
```
Login → Invalidates ALL previous sessions → Creates new session record
Every API request → Middleware checks UserSession.is_active
Admin force-logout → Sets is_active=False → Next request returns 401
```

### 4. Session Tracking
Every login records:
- IP address (with X-Forwarded-For support)
- Device type (desktop/mobile/tablet)
- Browser and OS
- Last activity timestamp (updated every 60s)

### 5. Video Security
- Students receive **embed URLs only** (`youtube.com/embed/...`)
- Direct YouTube URL never exposed to students
- Right-click disable + watermark handled on frontend
- `fs=0` parameter disables YouTube fullscreen (reduces download risk)

### 6. Rate Limiting
```
Anonymous:     20 requests/hour
Authenticated: 500 requests/hour
Login:         10 attempts/hour
```

### 7. HTTP Security Headers (Production)
```
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
X_FRAME_OPTIONS = DENY
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## Admin Panel Features

### User Management (`/admin/users/user/`)
- View all users with role badges (colored)
- Filter by role, active status, join date
- Create/edit users with role assignment
- Bulk activate/deactivate users
- Force logout selected users
- View active sessions inline on each user

### Course Management (`/admin/courses/course/`)
- View all courses with status badges and stats
- Publish/archive/draft courses in bulk
- Add videos inline on the course edit page
- View enrollments inline
- Slug auto-generated from title

### Video Management (`/admin/courses/video/`)
- Thumbnail preview from YouTube
- Order management
- Active/inactive toggle

### Enrollment Management (`/admin/courses/enrollment/`)
- Visual progress bars per enrollment
- Bulk activate/deactivate enrollments
- Filter by course and user

### Session Management (`/admin/sessions/usersession/`)
- See all active/ended sessions
- IP, device, browser, OS columns
- Bulk terminate sessions
- Filter by active status, device type

---

## Production Deployment

```bash
# Install production dependencies
pip install gunicorn psycopg2-binary redis django-redis

# Set environment variables
export DJANGO_SETTINGS_MODULE=config.settings
export DEBUG=False
export SECRET_KEY=your-production-secret-key

# Run with Gunicorn
gunicorn config.wsgi:application \
    --workers 4 \
    --worker-class gthread \
    --threads 2 \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile -

# Nginx config snippet (proxy to gunicorn):
# location /api/ { proxy_pass http://127.0.0.1:8000; }
# location /admin/ { proxy_pass http://127.0.0.1:8000; }
# location /static/ { alias /path/to/staticfiles/; }
```

### Scalability Notes (500+ Users)
- **Database**: PostgreSQL with connection pooling (pgBouncer)
- **Caching**: Redis for sessions, throttle counters, activity updates
- **Static files**: WhiteNoise (or CDN for high traffic)
- **Workers**: 4+ Gunicorn workers; scale horizontally behind load balancer
- **DB Indexes**: Added on `email`, `role`, `is_active`, `user+course` pairs
- **Pagination**: All list endpoints paginated (20/page)
- **Throttling**: Rate limits protect against abuse

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (required) | Django secret key |
| `DEBUG` | `False` | Debug mode |
| `ALLOWED_HOSTS` | `localhost` | Comma-separated hosts |
| `DB_ENGINE` | `sqlite3` | Database engine |
| `DB_NAME` | `lms.db` | Database name |
| `DB_USER` | — | Database user |
| `DB_PASSWORD` | — | Database password |
| `DB_HOST` | — | Database host |
| `REDIS_URL` | `redis://localhost:6379/1` | Redis connection URL |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `60` | Access token lifetime |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `7` | Refresh token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
