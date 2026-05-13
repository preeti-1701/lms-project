# ⚡ EduLearn – Django E-Learning Platform

A full-featured e-learning platform built with Python, Django, HTML, CSS, and SQLite3.

---

## 🚀 Quick Start (VS Code)

### Prerequisites
- Python 3.10+ installed
- pip available

### Steps

**1. Open the project folder in VS Code**
```
File → Open Folder → select `elearning_project`
```

**2. Open the Terminal in VS Code**
```
Terminal → New Terminal  (or Ctrl + `)
```

**3. Run the setup script**

On **Windows**:
```bash
start.bat
```

On **Mac / Linux**:
```bash
chmod +x start.sh
./start.sh
```

**Or run manually step by step:**
```bash
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

**4. Open your browser**
```
http://127.0.0.1:8000
```

---

## 👤 Test Accounts

| Role       | Username   | Password   |
|------------|------------|------------|
| Student    | student    | pass1234   |
| Instructor | instructor | pass1234   |
| Admin      | admin      | admin1234  |

Django Admin Panel: `http://127.0.0.1:8000/admin`

---

## 📁 Project Structure

```
elearning_project/
├── manage.py
├── requirements.txt
├── start.bat              ← Windows quick start
├── start.sh               ← Mac/Linux quick start
├── db.sqlite3             ← Auto-created database
│
├── elearning_project/     ← Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
└── elearning/             ← Main app
    ├── models.py          ← Database models
    ├── views.py           ← Page logic
    ├── urls.py            ← URL routes
    ├── forms.py           ← Form definitions
    ├── admin.py           ← Admin configuration
    ├── templates/         ← HTML templates
    │   └── elearning/
    │       ├── base.html
    │       ├── login.html
    │       ├── register.html
    │       ├── dashboard.html
    │       ├── course_list.html
    │       ├── course_detail.html
    │       ├── course_form.html
    │       ├── manage_course.html
    │       ├── lesson.html
    │       └── profile.html
    ├── static/
    │   ├── css/style.css
    │   └── js/main.js
    ├── templatetags/
    │   └── custom_filters.py
    └── management/
        └── commands/
            └── seed_data.py
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | Register, Login, Logout |
| 📚 Courses | Browse, Search, Filter by category/level |
| 🎓 Enrollment | One-click enroll, progress tracking |
| 📹 Video Lessons | YouTube embed support |
| 🏫 Instructor Panel | Create & manage courses, add/delete lessons |
| 👤 Profile | Bio, avatar URL, enrollment history |
| 🗃️ Admin | Full Django admin panel |
| 📱 Responsive | Works on mobile & desktop |

---

## 🛠 Technologies

- **Backend**: Python 3, Django 4.2
- **Frontend**: HTML5, CSS3, Vanilla JS
- **Database**: SQLite3
- **Fonts**: Google Fonts (Syne + DM Sans)
