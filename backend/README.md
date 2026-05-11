# LMS Backend - Node.js + Express + PostgreSQL

Complete backend for the Learning Management System with authentication, role-based access control, and course management.

## 🎯 Features

- ✅ User authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, Trainer, Student)
- ✅ PostgreSQL database with proper constraints
- ✅ RESTful API design
- ✅ CORS enabled
- ✅ Comprehensive error handling
- ✅ Database connection pooling
- ✅ Sample data for testing

## 📋 Tech Stack

- **Runtime:** Node.js 14+
- **Framework:** Express.js
- **Database:** PostgreSQL 12+
- **Authentication:** JWT
- **Password Hashing:** bcrypt
- **Database Driver:** node-postgres (pg)

## 🚀 Quick Start

### 1. Prerequisites

- PostgreSQL installed and running
- Node.js 14+ installed
- npm installed

### 2. Clone or Use Existing Backend

```bash
cd backend
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
# Default values work if PostgreSQL is running locally with default settings
```

### 4. Initialize Database (Automated)

```bash
# Create database and schema only
node init_database.js

# Create database, schema, and import sample data
node init_database.js --seed
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 Manual Database Setup

If you prefer manual setup instead of using `init_database.js`:

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE lms_db;"

# 2. Create schema
psql -U postgres -d lms_db -f db.sql

# 3. Import sample data
psql -U postgres -d lms_db -f sample_data.sql
```

## 🔐 Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@lms.com | LmsTest@123 |
| **Trainer** | john@lms.com | LmsTest@123 |
| **Student** | alice@lms.com | LmsTest@123 |

More users available - see [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

## 🗄️ Database Schema

### users
```sql
id (PRIMARY KEY)
name VARCHAR(100)
email VARCHAR(150) UNIQUE
password VARCHAR(255) -- bcrypt hashed
role ENUM ('admin', 'trainer', 'student')
created_at TIMESTAMP
```

### courses
```sql
id (PRIMARY KEY)
title VARCHAR(255)
description TEXT
created_by (FOREIGN KEY → users.id)
created_at TIMESTAMP
```

### videos
```sql
id (PRIMARY KEY)
course_id (FOREIGN KEY → courses.id)
youtube_link TEXT
created_at TIMESTAMP
```

### enrollments
```sql
id (PRIMARY KEY)
user_id (FOREIGN KEY → users.id)
course_id (FOREIGN KEY → courses.id)
enrolled_at TIMESTAMP
UNIQUE(user_id, course_id)
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Users (Admin Only)
- `POST /api/users/create` - Create new user
- `GET /api/users/all` - List all users

### Courses
- `POST /api/course/create` - Create course (Trainer only)
- `GET /api/course/all` - List all courses
- `POST /api/course/enroll` - Assign course to student (Admin only)
- `GET /api/course/student-courses` - Get student's enrolled courses

### Videos
- `POST /api/video/add` - Add video to course (Trainer only)
- `GET /api/video/:courseId` - Get videos for a course

### Health
- `GET /` - Server status
- `GET /api/health` - Database and server health check

## 🔑 Authentication

All protected endpoints require JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/course/all
```

**Getting a Token:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "LmsTest@123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "name": "Admin User"
}
```

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # Database connection pool
├── controllers/
│   ├── authController.js        # Auth logic
│   ├── userController.js        # User management
│   ├── courseController.js      # Course management
│   └── videoController.js       # Video management
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   └── roleMiddleware.js        # Role-based access control
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── userRoutes.js            # User endpoints
│   ├── courseRoutes.js          # Course endpoints
│   └── videoRoutes.js           # Video endpoints
├── db.sql                       # Database schema
├── sample_data.sql              # Sample data
├── init_database.js             # Database init script
├── generate_password_hash.js    # Password hash generator
├── server.js                    # Express server
├── .env.example                 # Environment template
├── .env                         # Environment (DO NOT COMMIT)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🛠️ Configuration

### Environment Variables

```env
PORT=5000                        # Server port
JWT_SECRET=your_secret_key      # JWT signing secret
PG_HOST=localhost               # PostgreSQL host
PG_PORT=5432                    # PostgreSQL port
PG_DATABASE=lms_db             # Database name
PG_USER=postgres               # Database user
PG_PASSWORD=postgres           # Database password
NODE_ENV=development           # Environment
```

### Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update `.env`

## 🧪 Testing

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "LmsTest@123"
  }'
```

### Test Database Health

```bash
curl http://localhost:5000/api/health
```

### Test Protected Route

```bash
# First, get a token (see above)
TOKEN="your_jwt_token_here"

# Then use it
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/users/all
```

## 🔍 Debugging

### Enable Detailed Logs

Add to `server.js`:

```javascript
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

### Database Connection Issues

```bash
# Test connection
node -e "const {testConnection} = require('./config/db'); testConnection();"
```

### Check PostgreSQL Status

```bash
# macOS
brew services list | grep postgresql

# Windows (PowerShell)
Get-Service | Find-Object Name "*Postgres*"

# Linux
sudo systemctl status postgresql
```

## 📖 Detailed Documentation

- **Database Setup:** See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Quick Reference:** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **API Documentation:** See route files in `routes/`

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| `FATAL: database 'lms_db' does not exist` | Run: `node init_database.js --seed` |
| `Connection refused at 127.0.0.1:5432` | Start PostgreSQL service |
| `Error: password authentication failed` | Check .env credentials |
| `Port 5000 already in use` | Change PORT in .env or kill process |

## 🔌 Next Steps

1. ✅ Backend setup complete
2. 👉 Set up frontend (see `../frontend/README.md`)
3. 👉 Configure API base URL in frontend
4. 👉 Test end-to-end flow

## 📦 Production Deployment

Before deploying to production:

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Use PG_PASSWORD with strong credentials
- [ ] Set NODE_ENV=production
- [ ] Use error logging service (e.g., Sentry)
- [ ] Enable HTTPS
- [ ] Use environment-specific .env files
- [ ] Set up database backups
- [ ] Enable query logging

## 🤝 Contributing

- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test changes before committing

## 📄 License

MIT

## 🆘 Support

For issues or questions:
1. Check [DATABASE_SETUP.md](./DATABASE_SETUP.md)
2. Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Check error logs in console
4. Verify database connection

---

**Version:** 1.0.0  
**Last Updated:** April 26, 2026
