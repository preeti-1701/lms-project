"""
LearnFlow LMS - Python Flask Backend
Connects the HTML frontend to OpenRouter AI API

Requirements:
    pip install flask flask-cors requests

Run:
    python app.py

Then open http://localhost:5000 in your browser.
"""

import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="static")
CORS(app)

# ── CONFIG ─────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "open_router")
OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL      = "openai/gpt-4o-mini"   # change to any OpenRouter model you like

# System prompt: gives the AI tutor personality & context
SYSTEM_PROMPT = """You are LearnFlow's AI Tutor — a knowledgeable, encouraging, and concise learning assistant.
You help students understand course material, answer questions, explain concepts clearly, and suggest next steps.
Keep responses focused and educational. Use bullet points or short paragraphs for clarity.
If a student seems stuck, break things down step-by-step.
Do NOT make up information you are not sure about — say so honestly."""


# ── SERVE FRONTEND ──────────────────────────────────────────────────────────
@app.route("/")
def index():
    """Serve the main HTML file."""
    return send_from_directory("static", "index.html")


# ── CHAT ENDPOINT ───────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Expects JSON body:
        {
            "message": "User's question",
            "history": [                    ← optional conversation history
                {"role": "user",      "content": "..."},
                {"role": "assistant", "content": "..."}
            ],
            "context": "optional course context string"
        }
    Returns:
        { "reply": "AI response text" }
    """
    data = request.get_json(silent=True) or {}

    user_message = (data.get("message") or "").strip()
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    history     = data.get("history", [])   # list of {role, content}
    course_ctx  = data.get("context", "")   # e.g. "Python Fundamentals, chapter 3"

    # Build the messages array
    system_content = SYSTEM_PROMPT
    if course_ctx:
        system_content += f"\n\nCurrent course context: {course_ctx}"

    messages = [{"role": "system", "content": system_content}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    # Call OpenRouter
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
        "HTTP-Referer":  "http://localhost:5000",   # required by OpenRouter
        "X-Title":       "LearnFlow LMS",
    }
    payload = {
        "model":       DEFAULT_MODEL,
        "messages":    messages,
        "max_tokens":  1024,
        "temperature": 0.7,
    }

    try:
        resp = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        result  = resp.json()
        reply   = result["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})

    except requests.exceptions.Timeout:
        return jsonify({"error": "OpenRouter timed out. Try again."}), 504
    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"OpenRouter error: {e.response.status_code} — {e.response.text}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── QUIZ ENDPOINT ───────────────────────────────────────────────────────────
@app.route("/api/quiz", methods=["POST"])
def generate_quiz():
    """
    Generate a short quiz on any topic.
    Expects JSON: { "topic": "Python loops", "num_questions": 3 }
    Returns: { "quiz": [ { "q": "...", "options": [...], "answer": "..." }, ... ] }
    """
    data  = request.get_json(silent=True) or {}
    topic = (data.get("topic") or "").strip()
    n     = min(int(data.get("num_questions", 3)), 10)

    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    prompt = (
        f"Create {n} multiple-choice quiz questions about: {topic}.\n"
        "Return ONLY valid JSON array, no markdown, no explanation.\n"
        'Format: [{"q":"question","options":["A","B","C","D"],"answer":"A"},...]'
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
        "HTTP-Referer":  "http://localhost:5000",
        "X-Title":       "LearnFlow LMS",
    }
    payload = {
        "model":       DEFAULT_MODEL,
        "messages":    [
            {"role": "system", "content": "You are a quiz generator. Output only valid JSON."},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens":  1500,
        "temperature": 0.5,
    }

    try:
        resp = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        raw  = resp.json()["choices"][0]["message"]["content"].strip()
        # Strip markdown fences if present
        raw  = raw.replace("```json", "").replace("```", "").strip()
        import json
        quiz = json.loads(raw)
        return jsonify({"quiz": quiz})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── SUMMARIZE ENDPOINT ──────────────────────────────────────────────────────
@app.route("/api/summarize", methods=["POST"])
def summarize():
    """
    Summarize a block of text (e.g. lecture notes).
    Expects JSON: { "text": "...", "style": "bullet|paragraph|eli5" }
    Returns: { "summary": "..." }
    """
    data  = request.get_json(silent=True) or {}
    text  = (data.get("text") or "").strip()
    style = data.get("style", "bullet")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    style_hint = {
        "bullet":    "Return the summary as concise bullet points.",
        "paragraph": "Return the summary as 2–3 short paragraphs.",
        "eli5":      "Explain it simply, as if to a 10-year-old.",
    }.get(style, "Return the summary as concise bullet points.")

    prompt = f"Summarize the following content. {style_hint}\n\n{text}"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
        "HTTP-Referer":  "http://localhost:5000",
        "X-Title":       "LearnFlow LMS",
    }
    payload = {
        "model":    DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": "You are a concise educational summarizer."},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens":  800,
        "temperature": 0.4,
    }

    try:
        resp = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        summary = resp.json()["choices"][0]["message"]["content"]
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── HEALTH CHECK ─────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model": DEFAULT_MODEL})


# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("  LearnFlow LMS Backend")
    print(f"  Model : {DEFAULT_MODEL}")
    print("  URL   : http://localhost:5000")
    print("=" * 50)

    key_set = OPENROUTER_API_KEY != "your-openrouter-api-key-here"
    if not key_set:
        print("\n⚠  Set your OpenRouter key:")
        print("   export OPENROUTER_API_KEY='sk-or-...'")
        print("   or edit the OPENROUTER_API_KEY variable in app.py\n")

    app.run(debug=True, port=5000)