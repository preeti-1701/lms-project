from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.models import Activity, Content, User
from app.schemas.schemas import ActivityLog, ActivityOut
from app.utils.auth import get_current_user
from app.utils.db import get_db

router = APIRouter(prefix="/track", tags=["Tracking"])

VALID_EVENTS = {"viewed", "started", "completed", "downloaded"}


@router.post("/", response_model=ActivityOut, status_code=201)
def log_activity(
    payload: ActivityLog,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a learning activity event for the current user."""
    if payload.event not in VALID_EVENTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event. Must be one of: {sorted(VALID_EVENTS)}",
        )
    content = db.query(Content).filter(Content.id == payload.content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    activity = Activity(
        user_id=current_user.id,
        content_id=payload.content_id,
        event=payload.event,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/me", response_model=List[ActivityOut])
def my_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all activity logs for the currently logged-in user."""
    return (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.timestamp.desc())
        .all()
    )


@router.get("/course/{course_id}", response_model=List[ActivityOut])
def course_activity(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all activity across a course's contents — instructor or admin only."""
    if current_user.role not in ("instructor", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    content_ids = [
        c.id for c in db.query(Content).filter(Content.course_id == course_id).all()
    ]
    return (
        db.query(Activity)
        .filter(Activity.content_id.in_(content_ids))
        .order_by(Activity.timestamp.desc())
        .all()
    )


@router.get("/user/{user_id}", response_model=List[ActivityOut])
def user_activity(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity logs for a specific user — admin or the user themselves."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return (
        db.query(Activity)
        .filter(Activity.user_id == user_id)
        .order_by(Activity.timestamp.desc())
        .all()
    )


@router.get("/progress/{course_id}", response_model=dict)
def course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return completion progress for the current user on a given course.
    Returns: { total_contents, completed_contents, progress_pct }
    """
    contents = db.query(Content).filter(Content.course_id == course_id).all()
    total = len(contents)
    if total == 0:
        return {"total_contents": 0, "completed_contents": 0, "progress_pct": 0}

    content_ids = [c.id for c in contents]
    completed = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id,
            Activity.content_id.in_(content_ids),
            Activity.event == "completed",
        )
        .distinct(Activity.content_id)
        .count()
    )
    return {
        "total_contents": total,
        "completed_contents": completed,
        "progress_pct": round(completed / total * 100, 1),
    }
