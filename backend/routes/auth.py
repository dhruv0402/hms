from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from models import db, User, Patient, Doctor

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    """Register a new patient account."""
    data = request.get_json()
    required = ["email", "password", "first_name", "last_name"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    try:
        user = User(
            email         = data["email"].strip().lower(),
            password_hash = generate_password_hash(data["password"]),
            role          = "patient",
        )
        db.session.add(user)
        db.session.flush()

        patient = Patient(
            user_id    = user.user_id,
            first_name = data["first_name"].strip(),
            last_name  = data["last_name"].strip(),
            dob        = data.get("dob"),
            gender     = data.get("gender"),
            blood_group= data.get("blood_group"),
            phone      = data.get("phone"),
            address    = data.get("address"),
            allergies  = data.get("allergies"),
        )
        db.session.add(patient)
        db.session.commit()

        access_token  = create_access_token(identity=str(user.user_id), additional_claims={"role": "patient"})
        refresh_token = create_refresh_token(identity=str(user.user_id))

        return jsonify({
            "message":       "Registration successful",
            "access_token":  access_token,
            "refresh_token": refresh_token,
            "user":          {**user.to_dict(), "patient_id": patient.patient_id},
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.post("/login")
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"].strip().lower()).first()
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Contact admin."}), 403

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token  = create_access_token(identity=str(user.user_id), additional_claims={"role": user.role})
    refresh_token = create_refresh_token(identity=str(user.user_id))

    profile_id = None
    if user.role == "patient" and user.patient:
        profile_id = user.patient.patient_id
    elif user.role == "doctor" and user.doctor:
        profile_id = user.doctor.doctor_id

    return jsonify({
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user": {
            **user.to_dict(),
            "profile_id": profile_id,
        },
    }), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    if not user:
        return jsonify({"error": "User not found"}), 404
    access_token = create_access_token(identity=identity, additional_claims={"role": user.role})
    return jsonify({"access_token": access_token}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = user.to_dict()
    if user.role == "patient" and user.patient:
        data["profile"] = user.patient.to_dict()
    elif user.role == "doctor" and user.doctor:
        data["profile"] = user.doctor.to_dict()

    return jsonify(data), 200


@auth_bp.put("/change-password")
@jwt_required()
def change_password():
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    data = request.get_json()

    if not check_password_hash(user.password_hash, data.get("old_password", "")):
        return jsonify({"error": "Old password is incorrect"}), 400

    user.password_hash = generate_password_hash(data["new_password"])
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200
