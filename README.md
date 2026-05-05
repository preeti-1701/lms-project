# 📚 LearnHub LMS — Django Project

A full-stack **Learning Management System** built with **Django + SQLite**.
Features 3 login roles, YouTube video lessons, screenshot protection, and real database storage.

---

## 🚀 How to Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create database
python manage.py makemigrations
python manage.py migrate

# 3. Create sample users and courses
python setup_data.py

# 4. Start server
python manage.py runserver
```

Open → **http://127.0.0.1:8000/login/**

---

## 🔐 Login Credentials

| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | admin     | admin123    |
| Student | student   | student123  |
| Trainer | preeti    | trainer123  |
| Trainer | rahul     | trainer123  |

---

## 🗂️ Project Structure

```
lms_final/
├── manage.py
├── requirements.txt
├── setup_data.py          ← Run once to create users & courses
├── db.sqlite3             ← Auto-created after migrate
├── lms/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── courses/
│   ├── models.py          ← Profile, Course, Enrollment
│   ├── views.py           ← All views for 3 roles
│   ├── urls.py            ← All URL routes
│   └── admin.py
├── templates/
│   ├── base.html
│   ├── profile.html
│   ├── registration/login.html
│   ├── admin_panel/
│   │   ├── dashboard.html
│   │   ├── courses.html
│   │   ├── edit_course.html
│   │   └── users.html
│   ├── student/
│   │   ├── dashboard.html
│   │   ├── courses.html
│   │   └── watch.html     ← YouTube player + screenshot logout
│   └── trainer/
│       ├── dashboard.html
│       └── courses.html
└── static/css/style.css
```

---

## 📋 Course Data Model

```python
Course:
  - title, edition, description
  - topics (comma separated)
  - duration, trainer, status
  - youtube_url  ← YouTube video link
```

---

## 🔑 Role-Based Access

### 👑 Admin
- See ALL courses with full details
- Add / Edit / Delete courses
- Add YouTube video URL to any course
- Manage all users and trainer assignments

### 📖 Student
- See course title + description only
- Enroll in courses
- Watch YouTube video (only if enrolled)
- **Auto logout if screenshot key is pressed**

### 🎓 Trainer
- See ONLY assigned courses
- Add new courses with YouTube URL
- Full course details view

---

## 🎥 YouTube Video Feature

- Admin or Trainer adds YouTube URL to course
- Student must **enroll first** to watch
- Video opens at: `/student/courses/<id>/watch/`
- **Watermark** (student name) shown over video
- **Auto logout** on screenshot keyboard shortcuts:
  - `PrtSc` (Print Screen)
  - `Win + Shift + S` (Snipping Tool)
  - `Cmd + Shift + 3/4/5` (Mac)
  - `Ctrl + P` (Print/Save as PDF)

---

## 🛠️ Tech Stack

| Layer      | Technology         |
|------------|--------------------|
| Backend    | Django 4.2         |
| Database   | SQLite (built-in)  |
| Frontend   | HTML5, CSS3, JS    |
| Fonts      | Google Fonts       |
| Auth       | Django Auth System |
| Video      | YouTube Embed API  |

---

## 📦 Push to GitHub

```bash
git init
git add .
git commit -m "feat: complete LMS with Django backend + YouTube + screenshot protection"
git branch -M main
git remote add origin https://github.com/mizbadarga7-lang/lms-project.git
git push -u origin main
```
