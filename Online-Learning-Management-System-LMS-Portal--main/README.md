# Online Learning Management System (LMS) API

A Django REST Framework-based backend project for managing an Online Learning Management System.

## Features

- Subject Management (CRUD)
- Course Management (CRUD)
- Module Management (CRUD)
- Topic Management (CRUD)
- Module Recordings Management (CRUD)
- Module Materials Management (CRUD)
- REST API built using Django REST Framework

---

## Tech Stack

- Python
- Django
- Django REST Framework
- SQLite Database
- Postman (for API testing)

---

## 📂 Project Structure

- LMS App → Subjects, Courses, Modules, Topics
- Students App → Learning content handling
- REST APIs for all models

---

## Installation & Setup

```bash
git clone https://github.com/your-username/your-repo-name.git
cd project15

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py runserver
