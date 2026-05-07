<<<<<<< HEAD
<!-- Software Requirements Specification (SRS) 
Learning Management System (LMS) 
Prepared for: LMS Project 
Version: 1.0 
1. Introduction 
1.1 Purpose 
This document describes the Software Requirements Specification (SRS) for a Simple and 
Secure Learning Management System (LMS).  
The purpose is to define functional and non-functional requirements clearly for 
development and implementation. 
1.2 Scope 
The LMS allows Admin/Trainers to upload course videos via YouTube links and Students to 
securely access and watch videos. 
The system ensures simplicity for students and reasonable security controls. 
2. Overall Description 
2.1 Product Perspective 
The LMS is a web-based application accessible via modern browsers. 
2.2 User Classes - Admin: Full system access - Trainer: Course and video management - Student: View-only access to assigned courses 
2.3 Operating Environment - Web browsers (Chrome, Edge, Firefox) - Desktop and Mobile devices 
3. Functional Requirements 
3.1 Authentication - Users shall log in using email/mobile and password - Only one active session per user is allowed - System shall auto-logout previous sessions on new login 
3.2 User Management - Admin shall create, edit, and disable users 
- Assign roles and courses 
3.3 Course Management - Admin/Trainer shall create courses - Add YouTube video links to courses 
3.4 Student Access - Students shall view only assigned courses - Students cannot download or share videos 
3.5 Session Control - System shall track IP and device info - Admin can force logout users 
4. Security Requirements - HTTPS communication - Encrypted password storage - Disable right-click and Print Screen - Dynamic watermark on videos - Token-based session validation 
5. Non-Functional Requirements - Easy to use UI - Fast page loading - Scalable to 500+ users - Mobile responsive design 
6. Assumptions & Constraints - Videos are hosted on YouTube - Complete prevention of screen recording is not possible - System focuses on deterrence and traceability 
7. Proposal Summary - Development Time: 2–3 weeks - Technology: React + Node.js/Django + PostgreSQL - Deployment: Cloud-based  -->
=======
# Learning Management System (LMS)

A secure and simple LMS built with React, Node.js (Express), and SQLite.

## Prerequisites
- Node.js (v16+)
- YouTube account (for video links)

## Project Structure
```
LMS/
├── backend/            # Express API
│   ├── config/         # DB Connection (SQLite)
│   ├── controllers/    # Business Logic
│   ├── middleware/     # Auth & Security
│   ├── routes/         # API Endpoints
│   ├── server.js       # Entry Point
│   ├── database.sqlite # Auto-generated DB file
│   └── .env            # Environment Variables
├── frontend/           # React App
│   ├── public/         # Static Files
│   ├── src/
│   │   ├── api/        # Axios Config
│   │   ├── components/ # UI Components
│   │   ├── context/    # State Management
│   │   ├── pages/      # Route Pages
│   │   ├── App.js      # Main Router
│   │   └── styles.css  # Global Styling
└── database/
    └── schema.sql      # SQL Tables
```

## Setup Instructions

### 1. Database Setup
1. Create a new PostgreSQL database named `lms_db`.
2. Run the SQL commands in `database/schema.sql` using your preferred tool (pgAdmin, psql, etc.).
   - Default Admin Credentials:
     - Email: `admin@lms.com`
     - Password: `Admin@123`

### 2. Backend Setup
1. Open a terminal in the `backend/` folder.
2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your PostgreSQL credentials and a secret JWT key.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   *The backend will run on http://localhost:5000*

### 3. Frontend Setup
1. Open a terminal in the `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   *The frontend will run on http://localhost:3000*

## Security Features Implemented
- **JWT Authentication**: Secure token-based access.
- **Single Active Session**: Automatically logs out previous sessions on new login.
- **IP & Device Tracking**: Monitored in the Admin Dashboard.
- **Role-Based Access**: Admin, Trainer, and Student roles with strict permissions.
- **Anti-Copy Protection**: Right-click, F12, and PrintScreen are disabled in the course viewer.
- **Dynamic Watermark**: Displays user email and date over videos to deter screen recording.
- **Secure Embedding**: YouTube videos are embedded with restricted branding and no related videos.
>>>>>>> 68204b39 (Initial commit)
