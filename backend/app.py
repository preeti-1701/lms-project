from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dummy database (later replace with real DB)
videos = []
@app.route('/')
def home():
    return "Backend is running successfully 🚀"
# Add YouTube video
@app.route('/add-video', methods=['POST'])
def add_video():
    data = request.json
    videos.append({
        "title": data['title'],
        "link": data['link']
    })
    return jsonify({"message": "Video added successfully"})

# Get all videos
@app.route('/videos', methods=['GET'])
def get_videos():
    return jsonify(videos)

if __name__ == '__main__':
    app.run(debug=True)