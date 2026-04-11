from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db
from socket_manager import socketio

# ── Blueprints ────────────────────────────────────────────────────────────────
from routes.auth import auth_bp
from routes.appointments import appt_bp
from routes.chat import chat_bp
from routes.other import (
    patients_bp, doctors_bp, billing_bp,
    prescriptions_bp, departments_bp, admin_bp
)
from routes.pharmacy import pharmacy_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── Extensions ────────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}},
         supports_credentials=True)
    socketio.init_app(app)

    # ── Register blueprints ───────────────────────────────────
    for bp in [auth_bp, appt_bp, chat_bp, patients_bp, doctors_bp,
               billing_bp, prescriptions_bp, departments_bp, admin_bp, pharmacy_bp]:
        app.register_blueprint(bp)

    # ── Health check ──────────────────────────────────────────
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "MediSync API"}), 200

    # ── Global error handlers ─────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()          # creates tables if not present
    socketio.run(app, debug=Config.DEBUG, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
