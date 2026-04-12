from flask import Flask, request, jsonify

app = Flask(__name__)

# Dummy users (temporary)
users = [
    {"email": "student@gmail.com", "password": "1234", "role": "student"},
    {"email": "admin@gmail.com", "password": "admin123", "role": "admin"}
]

# Home route (for browser testing)
@app.route('/')
def home():
    return "LMS Backend is running "

@app.route('/test-login')
def test_login():
    return "Login route exists!"
    
# Login API
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data provided"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        for user in users:
            if user["email"] == email and user["password"] == password:
                return jsonify({
                    "message": "Login successful",
                    "role": user["role"]
                }), 200

        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"message": "Something went wrong", "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
