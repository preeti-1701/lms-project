import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.models import Content, Course, Enrollment, User
from app.schemas.schemas import ContentOut, CourseCreate, CourseOut, EnrollmentOut
from app.utils.auth import get_current_user
from app.utils.db import get_db

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/course", tags=["Courses"])


# ─── Courses ──────────────────────────────────────────────────────────────────

@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new course. Instructors and admins only."""
    if current_user.role not in ("instructor", "admin"):
        raise HTTPException(status_code=403, detail="Only instructors can create courses")
    course = Course(
        title=payload.title,
        description=payload.description,
        instructor_id=current_user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    """List all available courses (public)."""
    return db.query(Course).all()


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a single course by ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a course — instructor (owner) or admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    db.delete(course)
    db.commit()


# ─── Content ──────────────────────────────────────────────────────────────────

@router.post(
    "/{course_id}/content/youtube",
    response_model=ContentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_youtube_content(
    course_id: int,
    title: str = Form(...),
    youtube_url: str = Form(...),
    order: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a YouTube video as course content. Instructor or admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    content = Content(
        title=title,
        content_type="youtube",
        youtube_url=youtube_url,
        course_id=course_id,
        order=order,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.post(
    "/{course_id}/content/upload",
    response_model=ContentOut,
    status_code=status.HTTP_201_CREATED,
)
def upload_content(
    course_id: int,
    title: str = Form(...),
    order: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file as course content. Instructor or admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    safe_name = f"course{course_id}_{file.filename}"
    dest = os.path.join(UPLOAD_DIR, safe_name)
    with open(dest, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    content = Content(
        title=title,
        content_type="file",
        file_path=dest,
        course_id=course_id,
        order=order,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.post(
    "/{course_id}/content/youtube",
    response_model=ContentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_youtube_content(
    course_id: int,
    title: str = Form(...),
    youtube_url: str = Form(...),
    order: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a YouTube video as course content. Instructor or admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    content = Content(
        title=title,
        content_type="youtube",
        youtube_url=youtube_url,
        course_id=course_id,
        order=order,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.get("/{course_id}/content", response_model=List[ContentOut])
def list_contents(course_id: int, db: Session = Depends(get_db)):
    """List all content items for a course, ordered by `order` field."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return (
        db.query(Content)
        .filter(Content.course_id == course_id)
        .order_by(Content.order)
        .all()
    )


@router.delete("/{course_id}/content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    course_id: int,
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a content item — instructor or admin only."""
    content = db.query(Content).filter(
        Content.id == content_id, Content.course_id == course_id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    course = db.query(Course).filter(Course.id == course_id).first()
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(content)
    db.commit()


# ─── Enrollment ───────────────────────────────────────────────────────────────

@router.post(
    "/{course_id}/enroll",
    response_model=EnrollmentOut,
    status_code=status.HTTP_201_CREATED,
)
def enroll(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Enroll the current user in a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/{course_id}/enrollments", response_model=List[EnrollmentOut])
def list_enrollments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all enrollments for a course — instructor or admin only."""
    if current_user.role not in ("instructor", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Enrollment).filter(Enrollment.course_id == course_id).all()


@router.patch("/{course_id}/complete", response_model=EnrollmentOut)
def mark_complete(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark the current user's enrollment in a course as completed."""
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")
    enrollment.completed = True
    db.commit()
    db.refresh(enrollment)
    return enrollment
