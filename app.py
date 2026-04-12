from flask import Flask, request, jsonify

app = Flask(__name__)

# Dummy users
users = [
    {"email": "student@gmail.com", "password": "1234", "role": "student"},
    {"email": "admin@gmail.com", "password": "admin123", "role": "admin"}
]

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    for user in users:
        if user["email"] == email and user["password"] == password:
            return jsonify({
                "message": "Login successful",
                "role": user["role"]
            }), 200

    return jsonify({"message": "Invalid credentials"}), 401


if __name__ == '__main__':
    app.run(debug=True)
