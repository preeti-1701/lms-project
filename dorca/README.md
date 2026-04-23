# LMS - Learning Management System
## React + Django REST Framework + PostgreSQL

### Project Structure
```
lms-project/
├── frontend/          # React (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities, API client, auth context
│   │   └── hooks/       # Custom React hooks
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Django REST Framework
│   ├── lms_project/   # Django project settings
│   ├── accounts/      # User auth, profiles, roles, sessions
│   ├── courses/       # Courses, videos, assignments, progress
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'lms_password';
ALTER ROLE lms_user SET client_encoding TO 'utf8';
ALTER ROLE lms_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE lms_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
```

2. Setup Django:
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # Create your admin user
python manage.py runserver 8000
```

3. Create first admin via Django shell:
```bash
python manage.py shell
>>> from accounts.models import UserRole
>>> from django.contrib.auth.models import User
>>> user = User.objects.get(username='admin')
>>> UserRole.objects.create(user=user, role='admin')
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173
Backend API runs on http://localhost:8000/api/

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | Login |
| POST | /api/auth/logout/ | Logout |
| GET | /api/auth/me/ | Current user profile |
| GET | /api/users/ | List users (admin) |
| PATCH | /api/users/:id/toggle-status/ | Toggle user active status |
| GET | /api/courses/ | List courses |
| POST | /api/courses/ | Create course |
| GET | /api/courses/:id/ | Course detail with videos |
| POST | /api/courses/:id/videos/ | Add video to course |
| POST | /api/courses/:id/assign/ | Assign course to user |
| POST | /api/videos/:id/complete/ | Mark video completed |
| GET | /api/sessions/ | List sessions (admin) |
| POST | /api/sessions/:id/force-logout/ | Force logout session |
