# -----------------------------
# Dummy Data (Database)
# -----------------------------
users = {
    "admin": {"password": "123", "role": "admin"},
    "student": {"password": "123", "role": "student"}
}

courses = []

current_user = None

# -----------------------------
# Login Function
# -----------------------------
def login():
    global current_user
    print("=== Login ===")
    username = input("Enter username: ")
    password = input("Enter password: ")

    if username in users and users[username]["password"] == password:
        current_user = username
        print("Login successful!\n")
    else:
        print("Invalid credentials\n")

# -----------------------------
# Dashboard
# -----------------------------
def dashboard():
    global current_user

    if not current_user:
        print("Please login first\n")
        return

    role = users[current_user]["role"]

    print(f"\nWelcome {current_user} ({role})")

    while True:
        print("\n1. View Courses")
        if role == "admin":
            print("2. Add Course")
        print("3. Logout")
