# 🎓 Complete LMS (Learning Management System)

A full-stack Learning Management System with admin approval, YouTube video integration, and comprehensive course management.

## ✨ Features

### 👨‍💼 Admin Features
- **User Approval System**: Approve/reject user registrations
- **Dashboard Analytics**: View system statistics and metrics
- **User Management**: Create, manage, and assign roles
- **Course Oversight**: Monitor all courses and enrollments

### 👨‍🏫 Instructor Features
- **Course Creation**: Create and manage multiple courses
- **Content Management**: 
  - Upload YouTube videos (embedded player)
  - Upload files (PDFs, videos, documents)
  - Organize content with custom ordering
- **Student Tracking**: View enrollments and progress

### 👨‍🎓 Student Features
- **Course Enrollment**: Browse and enroll in available courses
- **Video Learning**: Watch YouTube videos directly in the platform
- **Resource Access**: Download course materials and files
- **Progress Tracking**: Mark courses as complete

## 🚀 Quick Start

### Backend Setup
```bash
cd lms-complete-project
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

Visit http://localhost:3000 and create an admin account to get started!

## 📖 Full Documentation

See README.md in the project folder for complete setup instructions, API documentation, and usage guide.
