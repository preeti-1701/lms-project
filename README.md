# 📚 LearnHub LMS — Django Project
A full-stack **Learning Management System** built with **Django + SQLite**. Features 3 login roles, YouTube video lessons, screenshot protection, and real database storage.

## 🚀 How to Run
```bash
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python setup_data.py
python manage.py runserver
```
Open → http://127.0.0.1:8000/login/

## 🔐 Login Credentials
Admin: admin / admin123  
Student: student / student123  
Trainer: preeti / trainer123  
Trainer: rahul / trainer123  

## 🗂️ Project Structure
```
lms_final/
├── manage.py
├── requirements.txt
├── setup_data.py
├── db.sqlite3
├── lms/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── courses/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── templates/
│   ├── base.html
│   ├── profile.html
│   ├── registration/login.html
│   ├── admin_panel/
│   ├── student/
│   └── trainer/
└── static/css/style.css
```

## 🛠️ Tech Stack
Django 4.2, SQLite, HTML, CSS, JavaScript, YouTube Embed API