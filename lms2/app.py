from flask import Flask, render_template, request, redirect, session
import sqlite3
import os

app = Flask(__name__)
app.secret_key = "secret123"

DB_NAME = "database.db"

# CREATE DATABASE + TABLE + DEFAULT USER
def init_db():
    conn = sqlite3.connect(DB_NAME)

    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            password TEXT,
            role TEXT
        )
    ''')

    # CHECK if admin already exists
    user = conn.execute("SELECT * FROM users WHERE email=?", 
                        ("admin@gmail.com",)).fetchone()

    # IF NOT → INSERT DEFAULT LOGIN
    if not user:
        conn.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
                     ("admin@gmail.com", "1234", "Admin"))
        print("✅ Default user created: admin@gmail.com / 1234")

    conn.commit()
    conn.close()

init_db()

# DATABASE CONNECTION
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# LOGIN
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        # TEMPORARY DIRECT LOGIN (bypass DB)
        if email == "admin@gmail.com" and password == "1234":
            session["user"] = email
            return redirect("/dashboard")
        else:
            return render_template("login.html", error="Invalid email or password")

    return render_template("login.html")
    

# DASHBOARD
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/")
    return render_template("dashboard.html")

# LOGOUT
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)