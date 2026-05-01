# 🎓 LMS — Learning Management System

A full-stack Learning Management System with role-based dashboards, YouTube video courses, real-time progress tracking, and session management.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS, Vite, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |

---

## 👥 Roles

### 👑 Admin
- Create / manage users (student, trainer, admin)
- Assign courses to students
- View student progress per course and per video
- Manage sessions — terminate any active session
- Force logout users
- Change passwords

### 🧑‍🏫 Trainer
- Create and delete courses
- Add / remove YouTube videos

### 👨‍🎓 Student
- View assigned courses
- Watch protected YouTube videos
- Progress auto-saved every 5 seconds

---

## ✨ Features

- **Content Protection** — watermark, right-click disabled, PrintScreen/F12 blocked
- **Session Control** — real-time force logout; student sees lockout screen with countdown
- **Progress Tracking** — per-video watched status, per-course %, overall completion
- **Role Guards** — admins cannot disable/logout themselves

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lms"
JWT_SECRET="your_secret_key"
PORT=5000
```

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:5000`

---

## 📁 Project Structure

```
LMS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       └── app.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Admin/
        │   ├── Trainer/
        │   └── Student/
        ├── components/
        ├── services/
        └── context/
```

---

## 🔑 Default Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | admin123 |
| Trainer | trainer@lms.com | trainer123 |

> Students are created by admin or via self-registration.

---

## 📌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login |
| GET | `/api/courses` | Get courses (role-filtered) |
| POST | `/api/courses/assign` | Assign course to student |
| GET | `/api/enrollments/me` | Student's enrolled courses |
| POST | `/api/progress` | Save video progress |
| GET | `/api/sessions` | All sessions (admin) |
| PUT | `/api/sessions/:id` | Terminate session |
| POST | `/api/users` | Create user (admin) |
| PATCH | `/api/users/:id/password` | Change password |

---

## 📄 License

MIT