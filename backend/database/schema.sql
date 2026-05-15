-- Drop tables if they exist (clean slate)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS video_progress CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,           -- bcrypt encrypted (cost 12)
    role        VARCHAR(50)  CHECK (role IN ('admin', 'trainer', 'student')) DEFAULT 'student',
    status      VARCHAR(50)  CHECK (status IN ('active', 'disabled')) DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── COURSES ──────────────────────────────────────────────────────────────────
CREATE TABLE courses (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── VIDEOS ───────────────────────────────────────────────────────────────────
CREATE TABLE videos (
    id          SERIAL PRIMARY KEY,
    course_id   INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- ─── ENROLLMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE enrollments (
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id  INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id)
);

-- ─── VIDEO PROGRESS ───────────────────────────────────────────────────────────
CREATE TABLE video_progress (
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id   INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    completed  BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);

-- ─── SESSIONS (Single Session + IP/Device Tracking) ──────────────────────────
CREATE TABLE sessions (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token         TEXT NOT NULL,
    ip_address    VARCHAR(45),                   -- IPv4 or IPv6
    device_info   TEXT,                          -- User-Agent string
    active_status BOOLEAN DEFAULT TRUE,          -- false = logged out / force-logout
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen     TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- heartbeat updated on every request
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_courses_created_by  ON courses(created_by);
CREATE INDEX idx_videos_course_id    ON videos(course_id);
CREATE INDEX idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX idx_sessions_token      ON sessions(token);
CREATE INDEX idx_sessions_active     ON sessions(active_status);
