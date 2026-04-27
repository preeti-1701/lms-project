# ⚡ Quick Start Guide - Get Running in 5 Minutes!

## Step 1: Install Dependencies (2 minutes)

### Backend
```bash
cd lms-complete-project
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Start Servers (1 minute)

### Option A: Use Startup Scripts

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd app
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Step 3: Create Admin Account (1 minute)

1. Open browser to **http://localhost:3000**
2. Click "Sign up"
3. Fill in:
   - Username: `admin`
   - Email: `admin@lms.com`
   - Password: `admin123`
   - Role: **admin** ⚠️ Important!
4. Click "Create Account"

## Step 4: You're Done! (1 minute)

1. Login with admin credentials
2. Create your first course
3. Add a YouTube video
4. Invite users!

---

## 🎬 Quick Test

### Test YouTube Video
1. Login as admin
2. Click "Create Course"
3. Add title: "Test Course"
4. Click "Manage" → "Add Content"
5. Select "YouTube Video"
6. Paste: `https://www.youtube.com/watch?v=_uQrJ0TkZlc`
7. Title: "Python Tutorial"
8. Click "Add Content"
9. View course to see video playing!

---

## 🔗 Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## ❓ Common Issues

**Port already in use?**
```bash
# Find and kill process on port 8000
# Windows: taskkill /F /IM python.exe
# macOS/Linux: kill $(lsof -t -i:8000)
```

**Module not found?**
```bash
pip install -r requirements.txt --force-reinstall
```

**npm errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Next Steps

- Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
- Check [API_TESTING.md](API_TESTING.md) for API examples
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

**Happy Learning! 🎓**
