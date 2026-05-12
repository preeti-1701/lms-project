# Quick Reference: PostgreSQL & Backend Setup

## 🚀 Fast Setup (5 minutes)

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE lms_db;"

# 2. Import schema
psql -U postgres -d lms_db -f db.sql

# 3. Import sample data
psql -U postgres -d lms_db -f sample_data.sql

# 4. Configure backend
cd backend
cp .env.example .env

# 5. Install dependencies
npm install

# 6. Start server
npm run dev
```

---

## 🔐 Sample Login Credentials

| User | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | LmsTest@123 |
| Trainer 1 | john@lms.com | LmsTest@123 |
| Trainer 2 | sarah@lms.com | LmsTest@123 |
| Student 1 | alice@lms.com | LmsTest@123 |
| Student 2 | bob@lms.com | LmsTest@123 |

---

## 🔧 Database Commands

### Connect to Database
```bash
psql -U postgres -d lms_db
```

### List Tables
```sql
\dt
```

### Count Records
```sql
SELECT 'users' as table, COUNT(*) FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments;
```

### Reset All Data
```sql
-- From within psql connected to lms_db
\i db.sql
\i sample_data.sql
```

### Delete All Data (Keep Tables)
```sql
DELETE FROM enrollments;
DELETE FROM videos;
DELETE FROM courses;
DELETE FROM users;
```

### Drop Everything (Reset to Fresh)
```sql
DROP DATABASE lms_db;
CREATE DATABASE lms_db;
-- Then run: \i db.sql and \i sample_data.sql
```

---

## 🧪 API Test Commands

### All requests need JWT token (except login/register)

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"LmsTest@123"}' | jq -r '.token')

echo $TOKEN  # Verify token was retrieved

# 2. Use token in subsequent requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users/all

# 3. Get courses list
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/course/all

# 4. Check API health
curl http://localhost:5000/api/health
```

---

## 🔑 Generate Password Hash

```bash
# Generate bcrypt hash for custom password
node generate_password_hash.js "MyPassword123"

# Output will be like:
# $2b$10$K2H8QVRPEY6M.Kb6QYGvUeXwrW9Ww8Zx3Z3J3Y3H3V3N3M3L3K3J
```

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `FATAL: database doesn't exist` | Run: `createdb -U postgres lms_db` |
| `FATAL: role 'postgres' does not exist` | Check PostgreSQL installation |
| `Connection refused at 127.0.0.1:5432` | Start PostgreSQL service |
| `Port 5000 already in use` | Change PORT in .env |
| `password authentication failed` | Check .env credentials |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `db.sql` | Database schema creation |
| `sample_data.sql` | Sample test data |
| `.env` | Configuration (DO NOT COMMIT) |
| `config/db.js` | Database connection pool |
| `server.js` | Express server with DB test |

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `lms_db` created
- [ ] Schema imported (db.sql)
- [ ] Sample data imported (sample_data.sql)
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check works (`curl http://localhost:5000/api/health`)
- [ ] Login works with sample credentials

---

## 📚 Documentation

- **Detailed Setup:** See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **API Routes:** See API route files in `routes/`
- **Controllers:** Business logic in `controllers/`
- **Middleware:** Auth & role checking in `middleware/`

---

**Quick Tip:** Save this file in your backend folder and refer to it during development!
