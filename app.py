from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# ------------------------
# DATABASE SETUP
# ------------------------
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    ''')

    # Courses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            youtube_link TEXT
        )
    ''')

    # Insert default courses
    cursor.execute("SELECT COUNT(*) FROM courses")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO courses (name, youtube_link) VALUES (?, ?)", 
                       ("Python", "https://youtube.com"))
        cursor.execute("INSERT INTO courses (name, youtube_link) VALUES (?, ?)", 
                       ("HTML", "https://youtube.com"))
        cursor.execute("INSERT INTO courses (name, youtube_link) VALUES (?, ?)", 
                       (".NET", "https://youtube.com"))

    conn.commit()
    conn.close()

# ------------------------
# SIGNUP
# ------------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data['username']
    password = data['password']

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", 
                   (username, password))

    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully"})

# ------------------------
# LOGIN
# ------------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", 
                   (username, password))
    user = cursor.fetchone()

    conn.close()

    if user:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# ------------------------
# GET COURSES
# ------------------------
@app.route('/courses', methods=['GET'])
def get_courses():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses")
    courses = cursor.fetchall()

    conn.close()

    course_list = []
    for c in courses:
        course_list.append({
            "id": c[0],
            "name": c[1],
            "link": c[2]
        })

    return jsonify(course_list)

# ------------------------
# RUN SERVER
# ------------------------
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
