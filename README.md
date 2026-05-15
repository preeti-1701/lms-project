# Secure Learning Management System (LMS)

A full-stack, secure LMS built with React, Node.js (Express), and PostgreSQL.

## Features

- **Role-Based Access Control**: Admin, Trainer, and Student roles.
- **Secure Authentication**: JWT-based authentication with single-session enforcement (new login invalidates previous sessions).
- **Course & Video Management**: Create courses and embed YouTube videos securely.
- **Security Deterrents**: Disabled right-click, disabled developer tools shortcuts, and a dynamic repeating watermark (showing user email and ID) to deter screen recording.

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v14+ recommended)
- Git (optional)

## Setup Instructions

### 1. Database Setup (CRITICAL)

1. **Install PostgreSQL**: Download and install from [postgresql.org](https://www.postgresql.org/download/).
2. **Set Password**: During installation, set a password (e.g., `postgres`).
3. **Create Database**: Open **pgAdmin 4** or **psql** and run:
   ```sql
   CREATE DATABASE lms_db;
   ```
4. **Run Schema**: Open the Query Tool in pgAdmin for `lms_db` and copy-paste the contents of `backend/database/schema.sql` and run it.
5. **Run Seed (Sample Data)**: Copy-paste the contents of `backend/database/seed.sql` and run it. This creates the following accounts (password is `password123` for all):
   - **Admin**: `admin@lms.com`
   - **Trainer**: `trainer@lms.com`
   - **Student**: `student1@lms.com`

### 2. Backend Setup

1. Open a terminal in the `backend` directory.
2. Install dependencies: `npm install`
3. Check `.env` file. Ensure `DB_PASSWORD` matches your PostgreSQL password.
4. Start server: `npm run dev`

### 3. Frontend Setup

1. Open a second terminal in the `frontend` directory.
2. Install dependencies: `npm install`
3. Start Vite: `npm run dev`

## Troubleshooting Common Errors

- **"DATABASE CONNECTION FAILED"**: Check your `backend/.env` file. The `DB_PASSWORD` must be EXACTLY what you set when you installed PostgreSQL.
- **"Video not loading"**: Ensure you use a valid YouTube URL. The system now automatically converts standard links to embed links.
- **"Unauthorized"**: Make sure you are using the correct portal (Student vs Admin).
- **"Port already in use"**: If you see this, a previous process might be running. Close all terminal windows or restart your computer.

## Usage

1. Go to `http://localhost:5173`.
2. Login as Admin (`admin@lms.com` / `password123`) to manage users and courses.
3. Login as Student (`student1@lms.com` / `password123`) to view and play videos.
