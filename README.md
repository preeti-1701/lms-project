### Setup

### 1. Django backend(port 8000)

```bash
pip install -r requirements.txt
python manage.py migrate
python seed_data.py   # optional re-seed
python manage.py runserver
```

Runs at **http://127.0.0.1:8000/** — HTML templates + REST API.

### 2. React frontend (port 5173)

**Open a SECOND terminal window** (keep the Django one running):

```bash
cd react-frontend
npm install
npm run dev
```

Runs at **http://localhost:5173/**

## 🔑 Demo Accounts (password: `demo1234`)

- **Student:** `student_demo` 
- **Instructor:** `priya_sharma`
- **Admin:** `admin` / `admin` for `/admin/`

