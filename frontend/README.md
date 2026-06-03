# LMS Frontend

Django Template-based frontend. Templates are in `backend/templates/lms/`.

## Templates
- base.html - Sidebar layout
- login.html / register.html - Auth pages  
- admin_dashboard.html - Admin overview with stats
- manage_users/courses/lessons/enrollments.html - CRUD tables
- trainer_dashboard.html / trainer_course_detail.html - Trainer views
- student_dashboard.html / student_course_detail.html - Student views
- watch_lesson.html - YouTube embedded video player

## Tech Stack
- Bootstrap 5.3 (CDN)
- Font Awesome 6.5 (CDN)
- Custom CSS in base.html

## Design
- Sidebar: Dark navy (#0f172a)
- Primary: Blue (#2563eb)
- Background: Light gray (#f1f5f9)
