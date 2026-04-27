from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.utils.db import get_db
from app.utils.auth import get_current_user, hash_password
from app.models.models import User, Course, Enrollment
from app.schemas.schemas import UserOut, UserRegister, CourseOut

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users/pending", response_model=List[UserOut])
def list_pending_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all users pending approval — admin only."""
    return db.query(User).filter(User.is_approved == False, User.role != "admin").all()


@router.put("/users/{user_id}/approve", response_model=UserOut)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Approve a user account — admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = True
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all users — admin only."""
    return db.query(User).all()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user_as_admin(
    payload: UserRegister,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create any user (student/instructor/admin) — admin only."""
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
        is_approved=True,  # Admin-created users are auto-approved
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/role", response_model=UserOut)
def change_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Change a user's role — admin only. new_role: student | instructor | admin"""
    if new_role not in ("student", "instructor", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Use: student, instructor, admin")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a user — admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


# ─── Course Management ────────────────────────────────────────────────────────

@router.get("/courses", response_model=List[CourseOut])
def list_all_courses(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all courses with enrollment counts — admin only."""
    return db.query(Course).all()


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Force-delete any course — admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


# ─── Enrollment Management ────────────────────────────────────────────────────

@router.get("/enrollments", response_model=List[dict])
def list_all_enrollments(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all enrollments across all courses — admin only."""
    enrollments = db.query(Enrollment).all()
    result = []
    for e in enrollments:
        result.append({
            "id": e.id,
            "user_id": e.user_id,
            "username": e.user.username if e.user else None,
            "course_id": e.course_id,
            "course_title": e.course.title if e.course else None,
            "enrolled_at": str(e.enrolled_at),
            "completed": e.completed,
        })
    return result


@router.post("/enroll", status_code=status.HTTP_201_CREATED)
def admin_enroll_student(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Enroll any student into any course — admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already enrolled in this course")
    enrollment = Enrollment(user_id=user_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"message": f"User {user.username} enrolled in course '{course.title}'", "enrollment_id": enrollment.id}


@router.delete("/enrollments/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_remove_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Remove an enrollment — admin only."""
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()


# ─── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Summary stats — admin only."""
    total_users = db.query(User).count()
    students = db.query(User).filter(User.role == "student").count()
    instructors = db.query(User).filter(User.role == "instructor").count()
    admins = db.query(User).filter(User.role == "admin").count()
    pending_users = db.query(User).filter(User.is_approved == False, User.role != "admin").count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    completed = db.query(Enrollment).filter(Enrollment.completed == True).count()

    return {
        "total_users": total_users,
        "students": students,
        "instructors": instructors,
        "admins": admins,
        "pending_approvals": pending_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "completed_enrollments": completed,
    }
