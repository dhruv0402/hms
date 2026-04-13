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

def get_mock_suggestion(symptoms):
    """Fallback logic using keyword matching for demo purposes."""
    s = symptoms.lower()
    mapping = {
        "Cardiology":      ["heart", "chest pain", "breathless", "palpitation", "cardiac", "angina"],
        "Neurology":       ["brain", "headache", "dizz", "seizure", "numb", "stroke", "migraine", "epilepsy"],
        "Orthopaedics":    ["bone", "joint", "fracture", "knee", "back pain", "spine", "muscle", "ortho"],
        "Paediatrics":     ["child", "baby", "infant", "vaccin", "pediatric", "growth", "newborn"],
        "Dermatology":     ["skin", "rash", "itch", "acne", "hair", "nail", "dermal"],
        "Gynaecology":     ["menstrual", "pregnan", "period", "women", "repro", "gynec"],
        "Oncology":        ["cancer", "tumor", "chemo", "malignant", "radiation"],
        "General Medicine":["fever", "cough", "cold", "body ache", "flu", "infection", "weakness", "vomit", "nausea"]
    }
    for dept, keywords in mapping.items():
        if any(k in s for k in keywords):
            found_k = next(k for k in keywords if k in s)
            return {
                "department": dept,
                "reasoning":  f"Based on symptoms related to '{found_k}', we recommend the {dept} department for specialized care."
            }
    return {
        "department": "General Medicine",
        "reasoning":  "Your symptoms appear general. A consultation with General Medicine is recommended for primary evaluation."
    }

@chat_bp.post("/suggest-department")
@jwt_required()
def suggest_department():
    """Predicts department based on symptoms with a robust fallback."""
    from models import Department
    data = request.get_json()
    symptoms = data.get("symptoms", "")
    
    if not symptoms:
        return jsonify({"error": "Symptoms required"}), 400
        
    # Check if we should use fallback immediately (invalid/placeholder key)
    groq_key = os.getenv("GROQ_API_KEY", "")
    use_fallback = not groq_key or "your_" in groq_key

    if not use_fallback:
        depts = [d.name for d in Department.query.all()]
        system = f"""You are a medical triage assistant. Given departments: {', '.join(depts)}, 
        identify the most appropriate one. Return ONLY a JSON object with keys 'department' and 'reasoning'."""
        
        payload = {
            "model":      "llama-3.3-70b-versatile",
            "max_tokens": 500,
            "messages":   [
                {"role": "system", "content": system},
                {"role": "user", "content": f"Symptoms: {symptoms}"}
            ],
        }
        
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions", 
                json=payload, 
                headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                timeout=5
            )
            if resp.ok:
                groq_data = resp.json()
                raw_text  = groq_data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
                if "```json" in raw_text:
                    raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                import json
                result = json.loads(raw_text)
                if result.get("department"):
                    return jsonify(result), 200
        except Exception:
            pass # Fall through to mock logic

    # Fallback to mock logic if AI fails or key is missing
    return jsonify(get_mock_suggestion(symptoms)), 200
