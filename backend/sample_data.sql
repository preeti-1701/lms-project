-- ============================================================================
-- LMS Database Sample Data
-- ============================================================================
-- This script populates the database with sample users, courses, videos,
-- and enrollments for testing purposes.
-- ============================================================================

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

-- Admin user (password: LmsTest@123)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'admin');

-- Trainer users (password: LmsTest@123)
INSERT INTO users (name, email, password, role) VALUES
  ('John Smith', 'john@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'trainer'),
  ('Sarah Johnson', 'sarah@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'trainer'),
  ('Michael Brown', 'michael@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'trainer');

-- Student users (password: LmsTest@123)
INSERT INTO users (name, email, password, role) VALUES
  ('Alice Davis', 'alice@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'student'),
  ('Bob Wilson', 'bob@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'student'),
  ('Carol Martinez', 'carol@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'student'),
  ('David Lee', 'david@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'student'),
  ('Eve Thompson', 'eve@lms.com', '$2b$10$oEYir.0.1U2Jglnw3k7P5.nH1xxZaFubNIbNp8CDGrn/mrG4y5i/u', 'student');

-- ============================================================================
-- SAMPLE COURSES
-- ============================================================================
-- Created by trainers (user_ids: 2, 3, 4)
-- ============================================================================

-- Courses by John Smith (user_id = 2)
INSERT INTO courses (title, description, created_by) VALUES
  ('Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript basics for building responsive websites', 2),
  ('Advanced React Patterns', 'Master React hooks, context API, and performance optimization techniques', 2);

-- Courses by Sarah Johnson (user_id = 3)
INSERT INTO courses (title, description, created_by) VALUES
  ('Database Design Mastery', 'Comprehensive guide to designing efficient PostgreSQL and MongoDB databases', 3),
  ('SQL for Analytics', 'Learn advanced SQL queries for business analytics and reporting', 3);

-- Courses by Michael Brown (user_id = 4)
INSERT INTO courses (title, description, created_by) VALUES
  ('Node.js & Express Backend', 'Build scalable backend services with Node.js and Express framework', 4),
  ('RESTful API Design', 'Design and build secure REST APIs following industry best practices', 4);

-- ============================================================================
-- SAMPLE VIDEOS
-- ============================================================================
-- YouTube video links for each course (course_ids: 1-6)
-- ============================================================================

-- Web Development Fundamentals (course_id = 1)
INSERT INTO videos (course_id, youtube_link) VALUES
  ('https://www.youtube.com/watch?v=qz0aGYrrlhU', 1),
  ('https://www.youtube.com/watch?v=9uKc2xVP0Ps', 1),
  ('https://www.youtube.com/watch?v=W6NZfCO5SIk', 1);

-- Advanced React Patterns (course_id = 2)
INSERT INTO videos (course_id, youtube_link) VALUES
  ('https://www.youtube.com/watch?v=Ido5qqvzIgs', 2),
  ('https://www.youtube.com/watch?v=Dql2AJ87l20', 2),
  ('https://www.youtube.com/watch?v=dpw9EHDh2bM', 2);

-- Database Design Mastery (course_id = 3)
INSERT INTO videos (course_id, youtube_link) VALUES
  ('https://www.youtube.com/watch?v=ztHopE5Wnpc', 3),
  ('https://www.youtube.com/watch?v=e-K8-Yc_Guo', 3);

-- SQL for Analytics (course_id = 4)
INSERT INTO videos (course_id, youtube_link) VALUES
  ('https://www.youtube.com/watch?v=BPHEbqUM-Mw', 4),
  ('https://www.youtube.com/watch?v=lC5n-lJPGmw', 4);

-- Node.js & Express Backend (course_id = 5)
INSERT INTO videos (course_id, youtube_link) VALUES
  ('https://www.youtube.com/watch?v=fBNz5xF-Kx4', 5),
  ('https://www.youtube.com/watch?v=fsCjFHuV1-c', 5);

-- RESTful API Design (course_id = 6)
INSERT INTO videos (course_id, youtube_link) VALUES
  ('https://www.youtube.com/watch?v=5wsgxBEck_E', 6),
  ('https://www.youtube.com/watch?v=S6FWFzNySKE', 6);

-- ============================================================================
-- SAMPLE ENROLLMENTS
-- ============================================================================
-- Students (user_ids: 5-9) enrolled in courses (course_ids: 1-6)
-- ============================================================================

-- Alice Davis (user_id = 5) enrolled in courses
INSERT INTO enrollments (user_id, course_id) VALUES
  (5, 1),
  (5, 2),
  (5, 5);

-- Bob Wilson (user_id = 6) enrolled in courses
INSERT INTO enrollments (user_id, course_id) VALUES
  (6, 1),
  (6, 3),
  (6, 4);

-- Carol Martinez (user_id = 7) enrolled in courses
INSERT INTO enrollments (user_id, course_id) VALUES
  (7, 2),
  (7, 5),
  (7, 6);

-- David Lee (user_id = 8) enrolled in courses
INSERT INTO enrollments (user_id, course_id) VALUES
  (8, 1),
  (8, 4),
  (8, 6);

-- Eve Thompson (user_id = 9) enrolled in courses
INSERT INTO enrollments (user_id, course_id) VALUES
  (9, 3),
  (9, 5),
  (9, 1);

-- ============================================================================
-- NOTE: Passwords are pre-hashed with bcrypt (cost factor: 10)
-- All passwords are set to: "LmsTest@123"
-- To generate bcrypt hashes, use the bcrypt library
-- ============================================================================
