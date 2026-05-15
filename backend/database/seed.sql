-- Passwords below are 'password123' hashed with bcrypt (cost 10)
-- $2b$10$f66h0JtLqQ3J0oQ2w2qL4Oe9n2110c7.bO2f0O.4Q/200y0G.pYh.

INSERT INTO users (name, email, password, role, status) VALUES 
('Admin User', 'admin@lms.com', '$2b$10$f66h0JtLqQ3J0oQ2w2qL4Oe9n2110c7.bO2f0O.4Q/200y0G.pYh.', 'admin', 'active'),
('Trainer User', 'trainer@lms.com', '$2b$10$f66h0JtLqQ3J0oQ2w2qL4Oe9n2110c7.bO2f0O.4Q/200y0G.pYh.', 'trainer', 'active'),
('Student One', 'student1@lms.com', '$2b$10$f66h0JtLqQ3J0oQ2w2qL4Oe9n2110c7.bO2f0O.4Q/200y0G.pYh.', 'student', 'active'),
('Student Two', 'student2@lms.com', '$2b$10$f66h0JtLqQ3J0oQ2w2qL4Oe9n2110c7.bO2f0O.4Q/200y0G.pYh.', 'student', 'active');

-- Assume Admin ID = 1, Trainer ID = 2, Student One ID = 3, Student Two ID = 4
INSERT INTO courses (title, description, created_by) VALUES
('Introduction to React', 'Learn the basics of React and component-based UI', 2),
('Advanced Node.js', 'Master backend development with Express and PostgreSQL', 2);

-- Assume React Course ID = 1, Node Course ID = 2
INSERT INTO videos (course_id, youtube_url, title, order_index) VALUES
(1, 'https://www.youtube.com/embed/SqcY0GlETPk', 'React Crash Course', 1),
(2, 'https://www.youtube.com/embed/Oe421EPjeBE', 'Node.js and Express.js - Full Course', 1);

-- Enroll Student One in React Course, Student Two in Node Course
INSERT INTO enrollments (user_id, course_id) VALUES
(3, 1),
(4, 2);
