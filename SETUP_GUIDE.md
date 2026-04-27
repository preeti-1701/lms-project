# 📚 Complete Setup & Usage Guide

## 🎯 Overview

This LMS has 3 user roles with different capabilities:

1. **Admin** - Approve users, manage system
2. **Instructor** - Create courses, upload content
3. **Student** - Enroll and learn

## 🔧 Installation Steps

### 1. Backend Installation

```bash
# Navigate to project
cd lms-complete-project

# Create virtual environment
python -m venv venv

# Activate (choose your OS)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Navigate to app directory
cd app

# Start server (runs on port 8000)
uvicorn main:app --reload
```

**Verify**: Open http://localhost:8000/docs - you should see API documentation

### 2. Frontend Installation

```bash
# Open NEW terminal
cd lms-complete-project/frontend

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm start
```

**Verify**: Browser should automatically open http://localhost:3000

## 👤 User Workflow

### A. Create Admin Account (First User)

1. Open http://localhost:3000/register
2. Fill in:
   - Username: admin
   - Email: admin@example.com
   - Password: admin123
   - Role: **admin** (important!)
3. Click "Create Account"
4. Admin accounts are **auto-approved**
5. Login at http://localhost:3000/login

### B. Admin Approves Users

1. Login as admin
2. You'll see "Pending User Approvals" section
3. Click "Approve" for users waiting
4. They can now login!

### C. Instructor Creates Course

1. Register as instructor (wait for admin approval)
2. Login after approval
3. Click "Create Course"
4. Add title & description
5. Click "Manage" on your course
6. Add content (see next section)

### D. Student Enrolls & Learns

1. Register as student (wait for admin approval)
2. Login after approval
3. Browse "Available Courses"
4. Click "Enroll Now"
5. Click on course to view content
6. Watch videos, download files
7. Click "Mark as Complete" when done

## 📹 Adding YouTube Videos

### Method 1: Via Course Management

1. Login as instructor
2. Go to your course → Click "Manage"
3. Click "Add Content"
4. Select "YouTube Video" tab
5. Enter:
   - Title: "Lesson 1: Introduction"
   - YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Order: 0 (lower numbers show first)
6. Click "Add Content"

### Method 2: Via API

```bash
curl -X POST "http://localhost:8000/course/1/content/youtube" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Introduction Video" \
  -F "youtube_url=https://www.youtube.com/watch?v=VIDEO_ID" \
  -F "order=0"
```

### YouTube URL Formats Supported

✅ Correct:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`

❌ Incorrect:
- `youtube.com/watch?v=dQw4w9WgXcQ` (missing https://)
- Just the video ID: `dQw4w9WgXcQ`

## 📤 Uploading Files

1. Click "Add Content" → "Upload File" tab
2. Enter title
3. Choose file (PDF, video, document)
4. Set order number
5. Click "Add Content"

Students can download these files from the course page.

## 🔐 Authentication Flow

### Registration
1. User fills registration form
2. If role = "admin" → Auto-approved ✅
3. If role = "instructor" or "student" → Needs approval ⏳
4. User receives success message

### Login
1. User enters credentials
2. System checks if approved
3. If not approved → Error: "Pending admin approval"
4. If approved → Receives JWT token → Redirected to dashboard

### Token Usage
All authenticated requests need the token:
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

## 🎨 Dashboard Views

### Admin Dashboard Shows:
- Total users count
- Pending approvals count
- Total courses
- Total enrollments
- List of users awaiting approval
- Quick action buttons

### Instructor Dashboard Shows:
- List of courses they created
- "Create Course" button
- Course management links

### Student Dashboard Shows:
- Enrolled courses (with progress)
- Available courses to enroll
- "Enroll Now" buttons

## 📊 Key API Endpoints

### Authentication
```
POST /user/register          - Create account
POST /user/login            - Get JWT token
GET  /user/me               - Current user info
GET  /user/me/enrollments   - My enrolled courses
```

### Courses
```
GET    /course/                    - All courses
POST   /course/                    - Create course
GET    /course/{id}                - Course details
POST   /course/{id}/enroll         - Enroll in course
GET    /course/{id}/content        - Course content
POST   /course/{id}/content/youtube - Add YouTube video
POST   /course/{id}/content/upload - Upload file
DELETE /course/{id}/content/{cid}  - Delete content
```

### Admin
```
GET  /admin/dashboard          - System stats
GET  /admin/users              - All users
GET  /admin/users/pending      - Users awaiting approval
PUT  /admin/users/{id}/approve - Approve user
POST /admin/users              - Create user
```

## 🔍 Testing the System

### Test Scenario: Complete Workflow

1. **Start Servers**
   ```bash
   # Terminal 1: Backend
   cd app && uvicorn main:app --reload
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

2. **Create Admin**
   - Register with role "admin"
   - Login immediately (auto-approved)

3. **Create Instructor & Student**
   - Open incognito/private window
   - Register as "instructor1" with role instructor
   - Register as "student1" with role student

4. **Approve Users (as admin)**
   - See both in "Pending Approvals"
   - Click "Approve" for each

5. **Create Course (as instructor)**
   - Login as instructor1
   - Create "Python Basics" course
   - Add YouTube video: 
     - Title: "Python Tutorial"
     - URL: `https://www.youtube.com/watch?v=_uQrJ0TkZlc`

6. **Enroll & Learn (as student)**
   - Login as student1
   - Find "Python Basics"
   - Click "Enroll Now"
   - Click course to view
   - Watch the video!
   - Click "Mark as Complete"

## 🛠️ Troubleshooting

### Problem: "Network Error" in frontend
**Solution**: 
- Check backend is running on port 8000
- Check browser console for CORS errors
- Verify `proxy: "http://localhost:8000"` in package.json

### Problem: Videos not playing
**Solution**:
- Verify YouTube URL is complete with https://
- Check browser console for errors
- Try different video (some are region-restricted)

### Problem: "Not authorized" errors
**Solution**:
- Check JWT token is being sent
- Verify token hasn't expired (24 hours default)
- Re-login to get new token

### Problem: Files not uploading
**Solution**:
- Check `/uploads` directory exists
- Verify file size (large files may timeout)
- Check server logs for errors

### Problem: Database errors
**Solution**:
- Delete `lms.db` file to reset database
- Restart backend server
- Re-create admin account

## 📁 Project Structure

```
lms-complete-project/
├── app/                       # Backend
│   ├── main.py               # FastAPI application
│   ├── models/models.py      # Database models
│   ├── routes/               # API endpoints
│   ├── schemas/schemas.py    # Request/response models
│   └── utils/                # Auth & database utilities
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── services/api.js   # API client
│   │   └── context/          # State management
│   └── public/
├── uploads/                   # Uploaded files
├── requirements.txt          # Python dependencies
└── README.md
```

## 🎓 Learning Path Suggestion

1. **Day 1**: Setup & create admin account
2. **Day 2**: Create instructor & student, approve them
3. **Day 3**: Create first course with YouTube video
4. **Day 4**: Test enrollment and video playback
5. **Day 5**: Explore admin dashboard and analytics

## 💡 Pro Tips

1. **Organize Content**: Use order numbers (0, 10, 20...) to leave gaps for future insertions
2. **Video Titles**: Be descriptive - "Lesson 3: Variables in Python" not just "Video 3"
3. **Course Descriptions**: Write clear learning objectives
4. **Testing**: Always test in incognito mode for different user roles
5. **Backup**: The database is in `lms.db` - backup before major changes

## 🚀 Next Steps

After basic setup, try:
- Add multiple courses
- Create course with mix of videos and files
- Test completion tracking
- Explore admin analytics
- Customize the UI colors/styling

---

**Need help?** Check the API docs at http://localhost:8000/docs
