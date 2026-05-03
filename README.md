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
