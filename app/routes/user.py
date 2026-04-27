from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.utils.db import get_db
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.models import User, Enrollment, Course
from app.schemas.schemas import UserRegister, UserLogin, UserOut, Token

router = APIRouter(prefix="/user", tags=["Users"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user. Role: student (default) | instructor | admin"""
    if payload.role not in ("student", "instructor", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Use: student, instructor, admin")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Auto-approve admins, others need approval
    is_approved = (payload.role == "admin")
    
    user = User(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
        is_approved=is_approved,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return a JWT bearer token. Use as: Bearer <token>"""
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Check if user is approved (admins are auto-approved)
    if user.role != "admin" and not user.is_approved:
        raise HTTPException(
            status_code=403, 
            detail="Account pending admin approval. Please wait for approval to access the system."
        )
    
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return profile of the currently authenticated user."""
    return current_user


@router.get("/me/enrollments")
def my_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all courses the current student is enrolled in."""
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    result = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()
        result.append({
            "enrollment_id": e.id,
            "course_id": e.course_id,
            "course_title": course.title if course else None,
            "enrolled_at": str(e.enrolled_at),
            "completed": e.completed,
        })
    return result


@router.get("/all", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users — admin only."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific user by ID — admin or self only."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user — admin or self only."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
