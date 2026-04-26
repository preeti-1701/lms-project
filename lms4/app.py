from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from routes.courses import courses_bp
from routes.users import users_bp

app = Flask(
    __name__,
    static_folder=os.path.join('..', 'frontend'),
    static_url_path=''
)
CORS(app)

# ── Register Blueprints ──
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(courses_bp, url_prefix='/api/courses')
app.register_blueprint(users_bp, url_prefix='/api/users')

# ── Health Check ──
@app.route('/api/health')
def health():
    return {'status': 'OK', 'message': 'LearnFlow LMS API is running (Python/Flask)'}

# ── Serve Frontend Pages ──
@app.route('/dashboard')
def dashboard():
    return send_from_directory(os.path.join('..', 'frontend', 'pages'), 'dashboard.html')

# ── Catch-all: serve index.html ──
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    file_path = os.path.join(frontend_dir, path)
    if path and os.path.exists(file_path):
        return send_from_directory(frontend_dir, path)
    return send_from_directory(frontend_dir, 'index.html')


if __name__ == '__main__':
    print("\n🚀 LearnFlow LMS — Python/Flask Server")
    print("📚 API: http://localhost:5000/api")
    print("🌐 Frontend: http://localhost:5000\n")
    app.run(debug=True, port=5000)
