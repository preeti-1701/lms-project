import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.models import models
from app.routes import course, tracking, user, admin
from app.utils.db import engine

# ── Bootstrap ─────────────────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
models.Base.metadata.create_all(bind=engine)   # creates all tables on startup

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Smart LMS API",
    description=(
        "Full-featured Learning Management System backend.\n\n"
        "**Roles:** `student` · `instructor` · `admin`\n\n"
        "## Quick Start\n"
        "1. **Register** → `POST /user/register` (set role: admin/instructor/student)\n"
        "2. **Login** → `POST /user/login` → copy the `access_token`\n"
        "3. **Authorize** → click 🔒 Authorize above, enter: `Bearer <token>`\n"
        "4. Use any endpoint!\n\n"
        "**Admin endpoints** are under `/admin/*` — require admin token."
    ),
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static uploads ────────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(user.router)
app.include_router(course.router)
app.include_router(tracking.router)
app.include_router(admin.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Smart LMS API is running 🚀",
        "docs": "/docs",
        "redoc": "/redoc",
        "quick_start": {
            "step1": "POST /user/register  → create your first admin user",
            "step2": "POST /user/login     → get Bearer token",
            "step3": "GET  /admin/dashboard → see system stats",
        }
    }
