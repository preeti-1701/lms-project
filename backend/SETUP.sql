-- ============================================================================
-- LMS Database Setup Instructions
-- ============================================================================

-- Step 1: Create the database (if not exists)
-- Run this command in psql or database client:
-- CREATE DATABASE lms_db;

-- Step 2: Connect to the database:
-- \c lms_db

-- Step 3: Run the schema creation script:
-- \i db.sql

-- Step 4: Run the sample data script:
-- \i sample_data.sql

-- Step 5: Verify the setup:
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Videos', COUNT(*) FROM videos
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM enrollments;

-- Step 6: Check a sample query:
SELECT 
  u.id, u.name, u.email, u.role, 
  COUNT(c.id) as courses_created
FROM users u
LEFT JOIN courses c ON c.created_by = u.id
WHERE u.role = 'trainer'
GROUP BY u.id, u.name, u.email, u.role;
