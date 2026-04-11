import os, requests
from flask import Blueprint, request, jsonify, stream_with_context, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_MODEL   = "claude-sonnet-4-20250514"

@chat_bp.post("")
@jwt_required()
def chat():
    """Proxy Claude API — keeps API key server-side."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        # No key configured — return helpful error
        return jsonify({
            "error": "ANTHROPIC_API_KEY not set in backend/.env",
            "hint":  "Add ANTHROPIC_API_KEY=sk-ant-... to your backend/.env file"
        }), 503

    data = request.get_json()
    messages  = data.get("messages", [])
    system    = data.get("system", "You are MediBot, a helpful hospital assistant.")
    max_tokens= data.get("max_tokens", 1000)

    if not messages:
        return jsonify({"error": "messages required"}), 400

    payload = {
        "model":      CLAUDE_MODEL,
        "max_tokens": max_tokens,
        "system":     system,
        "messages":   messages,
    }

    try:
        resp = requests.post(
            CLAUDE_API_URL,
            json=payload,
            headers={
                "x-api-key":         api_key,
                "anthropic-version": "2023-06-01",
                "content-type":      "application/json",
            },
            timeout=30
        )
        if not resp.ok:
            return jsonify({"error": resp.json().get("error", {}).get("message", "Claude API error")}), resp.status_code

        claude_data = resp.json()
        text = next((c["text"] for c in claude_data.get("content", []) if c.get("type") == "text"), "")
        return jsonify({"reply": text}), 200

    except requests.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.post("/suggest-department")
@jwt_required()
def suggest_department():
    """Predicts department based on symptoms."""
    from models import Department
    data = request.get_json()
    symptoms = data.get("symptoms", "")
    
    if not symptoms:
        return jsonify({"error": "Symptoms required"}), 400
        
    depts = [d.name for d in Department.query.all()]
    
    system = f"""You are a medical triage assistant. Given a list of departments: {', '.join(depts)}, 
    identify which one is most appropriate for the symptoms. 
    Return ONLY a JSON object with keys 'department' and 'reasoning'."""
    
    user_msg = f"Symptoms: {symptoms}"
    
    # Switched to Groq for better accessibility
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key: return jsonify({"error": "AI not configured"}), 503
    
    payload = {
        "model":      "llama-3.3-70b-versatile",
        "max_tokens": 500,
        "messages":   [
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg}
        ],
    }
    
    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions", 
            json=payload, 
            headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
        )
        groq_data = resp.json()
        raw_text = groq_data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        # Extract JSON if wrapped in markdown
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        
        import json
        return jsonify(json.loads(raw_text)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
