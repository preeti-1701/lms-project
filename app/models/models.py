from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Boolean, Text
)
from sqlalchemy.orm import relationship
from app.utils.db import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String, unique=True, index=True, nullable=False)
    email      = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)
    role       = Column(String, default="student")   # student | instructor | admin
    is_approved = Column(Boolean, default=False)  # Admin approval required
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="user")
    activities  = relationship("Activity",   back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String, nullable=False)
    description   = Column(Text, default="")
    instructor_id = Column(Integer, ForeignKey("users.id"))
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    instructor  = relationship("User")
    contents    = relationship("Content",    back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Content(Base):
    __tablename__ = "contents"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, nullable=False)
    content_type = Column(String, default="file")   # file | video | text | youtube
    file_path    = Column(String, nullable=True)
    youtube_url  = Column(String, nullable=True)    # for YouTube videos
    body         = Column(Text,   nullable=True)    # for inline text/markdown content
    course_id    = Column(Integer, ForeignKey("courses.id"))
    order        = Column(Integer, default=0)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    course     = relationship("Course",   back_populates="contents")
    activities = relationship("Activity", back_populates="content")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"),   nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed   = Column(Boolean, default=False)

    user   = relationship("User",   back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Activity(Base):
    __tablename__ = "activity"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"),    nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=True)
    event      = Column(String,  nullable=False)   # viewed | completed | downloaded | started
    timestamp  = Column(DateTime, default=datetime.datetime.utcnow)

    user    = relationship("User",    back_populates="activities")
    content = relationship("Content", back_populates="activities")
