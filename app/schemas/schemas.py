from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── User ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "student"   # student | instructor | admin


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Course ───────────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = ""


class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    instructor_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Content ──────────────────────────────────────────────────────────────────

class ContentOut(BaseModel):
    id: int
    title: str
    content_type: str
    file_path: Optional[str]
    youtube_url: Optional[str]
    body: Optional[str]
    course_id: int
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Enrollment ───────────────────────────────────────────────────────────────

class EnrollmentOut(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    completed: bool

    class Config:
        from_attributes = True


# ─── Activity / Tracking ──────────────────────────────────────────────────────

class ActivityLog(BaseModel):
    content_id: int
    event: str   # viewed | completed | downloaded | started


class ActivityOut(BaseModel):
    id: int
    user_id: int
    content_id: Optional[int]
    event: str
    timestamp: datetime

    class Config:
        from_attributes = True
