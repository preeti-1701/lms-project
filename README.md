# Secure LMS Django Website

A simple Learning Management System built with Django, Bootstrap, SQLite for local development, and YouTube video embeds.

## Features

- Email, mobile, or username login
- One active session per user, with previous sessions logged out on new login
- Admin-managed roles: Admin, Trainer, Student
- Course, YouTube video, and enrollment management
- Admin assignment of trainers to specific courses
- Student dashboard for assigned courses only
- Trainer dashboard and video tools limited to assigned courses
- Trainers cannot create or self-assign courses; admins create/assign courses
- IP address and device tracking on login
- Admin force logout from Django admin
- Dynamic video watermark and browser-level deterrence for right-click/print shortcuts
