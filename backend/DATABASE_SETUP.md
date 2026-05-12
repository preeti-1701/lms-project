# LMS Backend Database Setup Guide

## Overview

This guide provides step-by-step instructions to set up the PostgreSQL database and configure the backend for the Learning Management System (LMS) project.

---

## Prerequisites

1. **PostgreSQL** installed and running (version 12 or higher)
2. **Node.js** installed (version 14 or higher)
3. **npm** installed
4. PostgreSQL client tools (psql or pgAdmin)

---

## Step 1: Verify PostgreSQL Installation

### Windows:
```powershell
postgres --version
```

### macOS/Linux:
```bash
postgres --version
```

**Expected output:** `postgres (PostgreSQL) 12.x.x` or higher

---

## Step 2: Create PostgreSQL Database

### Option A: Using psql CLI

```bash
# Connect to PostgreSQL (default password: postgres)
psql -U postgres

# In psql terminal, create database:
CREATE DATABASE lms_db;

# List databases
\l

# Exit psql
\q
```

### Option B: Using pgAdmin GUI
1. Open pgAdmin 4
2. Right-click on "Databases" → Create → Database
3. Enter Database Name: `lms_db`
4. Click "Save"

---

## Step 3: Import Database Schema

### Option A: Using psql CLI

```bash
# Connect to the lms_db database
psql -U postgres -d lms_db

# Run the schema creation script
\i db.sql

# Verify tables were created
\dt

# Exit
\q
```

### Option B: Manual SQL Execution

```bash
psql -U postgres -d lms_db -f db.sql
```

---

## Step 4: Import Sample Data (Optional)

This step is optional but recommended for testing purposes.

```bash
# Connect to database and import sample data
psql -U postgres -d lms_db -f sample_data.sql
```

### Verify Sample Data:

```sql
-- Run these queries to verify data was imported correctly
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_videos FROM videos;
SELECT COUNT(*) as total_enrollments FROM enrollments;
```

---

## Step 5: Configure Backend Environment

### Copy Environment Template:

```bash
cd backend
cp .env.example .env
```

### Edit `.env` file with your database credentials:

```
PORT=5000
JWT_SECRET=supersecretjwtkey123fortesting
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=lms_db
PG_USER=postgres
PG_PASSWORD=postgres
NODE_ENV=development
```

### Update credentials if different:

- If you used different PostgreSQL credentials, update `PG_USER` and `PG_PASSWORD`
- For production, generate a strong JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

## Step 6: Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 7: Test Database Connection

### Method 1: Using the health check endpoint

Once the server is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-04-26T12:00:00.000Z",
  "uptime": 5.234
}
```

### Method 2: Direct connection test

```bash
node -e "const { testConnection } = require('./config/db'); testConnection();"
```

---

## Step 8: Start the Backend Server

```bash
# Development mode (with nodemon)
npm run dev

# Or production mode
npm start
```

### Expected output:
```
✓ PostgreSQL connection successful
  Timestamp: 2026-04-26T12:00:00.000Z
✓ Database connection pool established
✓ Server listening on port 5000
✓ Environment: development
✓ API base URL: http://localhost:5000/api
```

---

## Step 9: Test API Endpoints

### Test Login Endpoint

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "LmsTest@123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "name": "Admin User"
}
```

### Test Health Check

```bash
curl http://localhost:5000/api/health
```

### Test Root Endpoint

```bash
curl http://localhost:5000/
```

---

## Database Schema Overview

### users
- Stores user accounts (admins, trainers, students)
- Indexes on email and role for fast lookups
- CASCADE deletion propagates to courses and enrollments

### courses
- Created by trainers
- References users table via created_by
- CASCADE deletion propagates to videos and enrollments

### videos
- YouTube video links for courses
- References courses table via course_id
- CASCADE deletion when course is deleted

### enrollments
- Student enrollments in courses
- Many-to-many relationship between users and courses
- UNIQUE constraint prevents duplicate enrollments

---

## Sample Data Credentials

### Admin User
- Email: `admin@lms.com`
- Password: `LmsTest@123`
- Role: `admin`

### Trainer Users
- John Smith: `john@lms.com` / `LmsTest@123`
- Sarah Johnson: `sarah@lms.com` / `LmsTest@123`
- Michael Brown: `michael@lms.com` / `LmsTest@123`

### Student Users
- Alice Davis: `alice@lms.com` / `LmsTest@123`
- Bob Wilson: `bob@lms.com` / `LmsTest@123`
- Carol Martinez: `carol@lms.com` / `LmsTest@123`
- David Lee: `david@lms.com` / `LmsTest@123`
- Eve Thompson: `eve@lms.com` / `LmsTest@123`

---

## Generate Custom Password Hashes

To create custom passwords for testing:

```bash
node generate_password_hash.js "your_new_password"
```

Output will display the bcrypt hash. Copy the hash and update `sample_data.sql`.

---

## Troubleshooting

### Error: "FATAL: role 'postgres' does not exist"
**Solution:** Check your PostgreSQL installation. Try:
```bash
psql -U postgres
```

### Error: "FATAL: password authentication failed"
**Solution:** Check your .env credentials match your PostgreSQL setup

### Error: "database 'lms_db' does not exist"
**Solution:** Create the database using Step 2 or:
```bash
createdb -U postgres lms_db
```

### Error: "Connection refused at 127.0.0.1:5432"
**Solution:** Ensure PostgreSQL service is running:

**Windows:**
```powershell
# Check PostgreSQL service
Get-Service | Find-Object Name -Like "*Postgres*"

# Start service if stopped
Start-Service -Name "postgresql-x64-12"
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Port 5000 Already in Use
**Modify backend/.env:**
```
PORT=5001  # Change to unused port
```

---

## Database Queries for Testing

### List all users by role:
```sql
SELECT id, name, email, role FROM users ORDER BY role, name;
```

### Get courses created by a trainer:
```sql
SELECT c.id, c.title, u.name as trainer
FROM courses c
JOIN users u ON u.id = c.created_by
WHERE u.name = 'John Smith';
```

### Get videos for a course:
```sql
SELECT v.id, v.youtube_link, c.title
FROM videos v
JOIN courses c ON c.id = v.course_id
WHERE c.id = 1;
```

### Get student's enrolled courses:
```sql
SELECT c.id, c.title, u.name as trainer
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN users u ON u.id = c.created_by
WHERE e.user_id = 5;
```

---

## Next Steps

1. ✓ Database created and schema implemented
2. ✓ Sample data imported
3. ✓ Backend configured
4. Next: Set up frontend (see frontend README)
5. Next: Configure API authentication in client

---

## File Structure

```
backend/
├── config/
│   └── db.js                 # Database connection pool
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── courseController.js
│   └── videoController.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── courseRoutes.js
│   └── videoRoutes.js
├── db.sql                    # Schema creation
├── sample_data.sql           # Sample data
├── generate_password_hash.js # Hash generator
├── .env                      # Configuration (DO NOT COMMIT)
├── .env.example             # Configuration template
├── server.js                # Main server file
├── package.json
└── README.md
```

---

## Support & Documentation

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js Pool: https://node-postgres.com/
- bcrypt: https://github.com/kelektiv/node.bcrypt.js
- JWT: https://www.npmjs.com/package/jsonwebtoken

---

**Last Updated:** April 26, 2026
**Version:** 1.0.0
