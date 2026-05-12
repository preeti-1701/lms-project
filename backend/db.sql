-- ============================================================================
-- LMS Database Schema - PostgreSQL
-- ============================================================================
-- This script creates the full database schema for the Learning Management
-- System with proper constraints, foreign keys, and indexes.
-- ============================================================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user account information with role-based access control
-- ============================================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'trainer', 'student')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
-- Stores course information created by trainers
-- ============================================================================
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_courses_created_by ON courses(created_by);

-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================
-- Stores YouTube video links associated with courses
-- ============================================================================
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  youtube_link TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_videos_course_id ON videos(course_id);

-- ============================================================================
-- ENROLLMENTS TABLE
-- ============================================================================
-- Stores student enrollments in courses (many-to-many relationship)
-- ============================================================================
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
