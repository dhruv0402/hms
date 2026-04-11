from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from models import (
    db, Patient, Doctor, Department, Bill, Prescription, PrescriptionMedicine,
    MedicalHistory, AvailabilitySlot, Appointment, AuditLog, User
)

# ──────────────────────────────────────────────────────────
#  PATIENTS
# ──────────────────────────────────────────────────────────
patients_bp = Blueprint("patients", __name__, url_prefix="/api/patients")

@patients_bp.get("")
@jwt_required()
def list_patients():
    claims = get_jwt()
    if claims.get("role") not in ("admin", "doctor"):
        return jsonify({"error": "Forbidden"}), 403
    search = request.args.get("search", "")
    q = Patient.query
    if search:
        q = q.filter(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%")) |
            (Patient.phone.ilike(f"%{search}%"))
        )
    patients = q.order_by(Patient.created_at.desc()).limit(50).all()
    return jsonify([p.to_dict() for p in patients]), 200


@patients_bp.get("/<int:patient_id>")
@jwt_required()
def get_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    return jsonify(patient.to_dict()), 200


@patients_bp.put("/<int:patient_id>")
@jwt_required()
def update_patient(patient_id):
    identity = get_jwt_identity()
    patient  = Patient.query.get_or_404(patient_id)
    claims   = get_jwt()

    if claims.get("role") == "patient":
        user = User.query.get(int(identity))
        if not user or user.patient.patient_id != patient_id:
            return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    for field in ["first_name","last_name","dob","gender","blood_group","phone","address","emergency_contact","allergies"]:
        if field in data:
            setattr(patient, field, data[field])
    db.session.commit()
    return jsonify({"message": "Profile updated", "patient": patient.to_dict()}), 200


@patients_bp.get("/<int:patient_id>/history")
@jwt_required()
def get_medical_history(patient_id):
    history = MedicalHistory.query.filter_by(patient_id=patient_id).order_by(MedicalHistory.diagnosed_date.desc()).all()
    return jsonify([h.to_dict() for h in history]), 200


@patients_bp.post("/<int:patient_id>/history")
@jwt_required()
def add_medical_history(patient_id):
    data = request.get_json()
    entry = MedicalHistory(
        patient_id     = patient_id,
        condition_name = data["condition_name"],
        diagnosed_date = data.get("diagnosed_date"),
        is_chronic     = data.get("is_chronic", False),
        treatment      = data.get("treatment"),
        notes          = data.get("notes"),
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify({"message": "History added", "entry": entry.to_dict()}), 201


# ──────────────────────────────────────────────────────────
#  DOCTORS
# ──────────────────────────────────────────────────────────
doctors_bp = Blueprint("doctors", __name__, url_prefix="/api/doctors")

@doctors_bp.get("")
@jwt_required()
def list_doctors():
    dept_id = request.args.get("dept_id", type=int)
    search  = request.args.get("search", "")
    q = Doctor.query
    if dept_id:
        q = q.filter_by(dept_id=dept_id)
    if search:
        q = q.filter(
            (Doctor.first_name.ilike(f"%{search}%")) |
            (Doctor.last_name.ilike(f"%{search}%")) |
            (Doctor.specialization.ilike(f"%{search}%"))
        )
    doctors = q.all()
    return jsonify([d.to_dict() for d in doctors]), 200


@doctors_bp.get("/<int:doctor_id>")
@jwt_required()
def get_doctor(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    data   = doctor.to_dict()
    data["slots"] = [s.to_dict() for s in (doctor.slots if doctor.slots else []) if s.is_active]
    return jsonify(data), 200


@doctors_bp.get("/<int:doctor_id>/appointments")
@jwt_required()
def doctor_appointments(doctor_id):
    date_filter = request.args.get("date")
    q = Appointment.query.filter_by(doctor_id=doctor_id)
    if date_filter:
        q = q.filter_by(appt_date=date_filter)
    appts = q.order_by(Appointment.appt_date.desc(), Appointment.appt_time).all()
    return jsonify([a.to_dict() for a in appts]), 200


@doctors_bp.post("")
@jwt_required()
def create_doctor():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json()
    required = ["email", "password", "first_name", "last_name", "dept_id"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    from werkzeug.security import generate_password_hash
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(email=data["email"], password_hash=generate_password_hash(data["password"]), role="doctor")
    db.session.add(user)
    db.session.flush()

    doctor = Doctor(
        user_id        = user.user_id,
        first_name     = data["first_name"],
        last_name      = data["last_name"],
        dept_id        = data["dept_id"],
        specialization = data.get("specialization"),
        qualification  = data.get("qualification"),
        experience_yrs = data.get("experience_yrs", 0),
        phone          = data.get("phone"),
        consultation_fee = data.get("consultation_fee", 500),
        bio            = data.get("bio"),
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({"message": "Doctor created", "doctor": doctor.to_dict()}), 201


@doctors_bp.post("/<int:doctor_id>/slots")
@jwt_required()
def add_slot(doctor_id):
    claims = get_jwt()
    if claims.get("role") not in ("admin",):
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json()
    slot = AvailabilitySlot(
        doctor_id    = doctor_id,
        day_of_week  = data["day_of_week"],
        start_time   = data["start_time"],
        end_time     = data["end_time"],
        max_patients = data.get("max_patients", 10),
    )
    db.session.add(slot)
    db.session.commit()
    return jsonify({"message": "Slot added", "slot": slot.to_dict()}), 201


# ──────────────────────────────────────────────────────────
#  BILLING
# ──────────────────────────────────────────────────────────
billing_bp = Blueprint("billing", __name__, url_prefix="/api/billing")

@billing_bp.get("")
@jwt_required()
def list_bills():
    claims   = get_jwt()
    identity = get_jwt_identity()
    role     = claims.get("role")

    q = Bill.query
    if role == "patient":
        user = User.query.get(int(identity))
        if not user or not user.patient:
            return jsonify({"error": "Not found"}), 404
        q = q.filter_by(patient_id=user.patient.patient_id)
    elif role != "admin":
        return jsonify({"error": "Forbidden"}), 403

    status = request.args.get("status")
    if status:
        q = q.filter_by(payment_status=status)

    bills = q.order_by(Bill.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bills]), 200


@billing_bp.get("/<int:bill_id>")
@jwt_required()
def get_bill(bill_id):
    bill = Bill.query.get_or_404(bill_id)
    data = bill.to_dict()
    data["appointment"] = bill.appointment.to_dict() if bill.appointment else None
    return jsonify(data), 200


@billing_bp.put("/<int:bill_id>")
@jwt_required()
def update_bill(bill_id):
    claims = get_jwt()
    if claims.get("role") not in ("admin",):
        return jsonify({"error": "Forbidden"}), 403
    bill = Bill.query.get_or_404(bill_id)
    data = request.get_json()

    for field in ["consultation_fee","medicine_cost","test_cost","other_charges","discount","payment_status","payment_method","notes"]:
        if field in data:
            setattr(bill, field, data[field])

    if data.get("payment_status") == "Paid" and not bill.paid_at:
        bill.paid_at = datetime.utcnow()

    db.session.commit()
    return jsonify({"message": "Bill updated", "bill": bill.to_dict()}), 200


@billing_bp.post("")
@jwt_required()
def create_bill():
    claims = get_jwt()
    if claims.get("role") not in ("admin",):
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json()
    bill = Bill(
        appt_id          = data["appt_id"],
        patient_id       = data["patient_id"],
        consultation_fee = data.get("consultation_fee", 0),
        medicine_cost    = data.get("medicine_cost", 0),
        test_cost        = data.get("test_cost", 0),
        other_charges    = data.get("other_charges", 0),
        discount         = data.get("discount", 0),
        payment_status   = data.get("payment_status", "Pending"),
        payment_method   = data.get("payment_method", "Cash"),
        notes            = data.get("notes"),
    )
    db.session.add(bill)
    db.session.commit()
    return jsonify({"message": "Bill created", "bill": bill.to_dict()}), 201


# ──────────────────────────────────────────────────────────
#  PRESCRIPTIONS
# ──────────────────────────────────────────────────────────
prescriptions_bp = Blueprint("prescriptions", __name__, url_prefix="/api/prescriptions")

@prescriptions_bp.get("/appointment/<int:appt_id>")
@jwt_required()
def get_prescription_by_appt(appt_id):
    pres = Prescription.query.filter_by(appt_id=appt_id).first()
    if not pres:
        return jsonify({"error": "Prescription not found"}), 404
    return jsonify(pres.to_dict()), 200


@prescriptions_bp.post("")
@jwt_required()
def create_prescription():
    claims = get_jwt()
    if claims.get("role") not in ("doctor", "admin"):
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json()
    pres = Prescription(
        appt_id        = data["appt_id"],
        diagnosis      = data["diagnosis"],
        notes          = data.get("notes"),
        follow_up_date = data.get("follow_up_date"),
    )
    db.session.add(pres)
    db.session.flush()
    for med in data.get("medicines", []):
        m = PrescriptionMedicine(
            prescription_id = pres.prescription_id,
            medicine_name   = med["medicine_name"],
            dosage          = med.get("dosage"),
            frequency       = med.get("frequency"),
            duration_days   = med.get("duration_days"),
            instructions    = med.get("instructions"),
        )
        db.session.add(m)
    db.session.commit()
    return jsonify({"message": "Prescription created", "prescription": pres.to_dict()}), 201


# ──────────────────────────────────────────────────────────
#  DEPARTMENTS
# ──────────────────────────────────────────────────────────
departments_bp = Blueprint("departments", __name__, url_prefix="/api/departments")

@departments_bp.get("")
@jwt_required()
def list_departments():
    depts = Department.query.order_by(Department.name).all()
    result = []
    for d in depts:
        item = d.to_dict()
        item["doctor_count"] = len(d.doctors)
        result.append(item)
    return jsonify(result), 200


# ──────────────────────────────────────────────────────────
#  ADMIN
# ──────────────────────────────────────────────────────────
admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

def require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Forbidden – admin only"}), 403

@admin_bp.get("/dashboard")
@jwt_required()
def dashboard():
    err = require_admin()
    if err: return err

    from sqlalchemy import func, text
    today = datetime.utcnow().date()

    total_patients    = Patient.query.count()
    total_doctors     = Doctor.query.count()
    todays_appts      = Appointment.query.filter_by(appt_date=today).count()
    pending_appts     = Appointment.query.filter_by(status="Scheduled").count()
    completed_appts   = Appointment.query.filter_by(status="Completed").count()
    pending_bills     = Bill.query.filter_by(payment_status="Pending").count()

    monthly_revenue = db.session.query(func.coalesce(func.sum(
        Bill.consultation_fee + Bill.medicine_cost + Bill.test_cost + Bill.other_charges - Bill.discount
    ), 0)).filter(
        Bill.payment_status == "Paid",
        func.month(Bill.paid_at) == today.month,
        func.year(Bill.paid_at)  == today.year,
    ).scalar()

    dept_stats = db.session.query(
        Department.name,
        func.count(Appointment.appt_id).label("count")
    ).join(Doctor, Doctor.dept_id == Department.dept_id)\
     .join(Appointment, Appointment.doctor_id == Doctor.doctor_id)\
     .group_by(Department.name).all()

    recent_appts = Appointment.query.order_by(Appointment.created_at.desc()).limit(8).all()

    return jsonify({
        "kpis": {
            "total_patients":    total_patients,
            "total_doctors":     total_doctors,
            "todays_appointments": todays_appts,
            "pending_appointments": pending_appts,
            "completed_appointments": completed_appts,
            "monthly_revenue":   float(monthly_revenue or 0),
            "pending_bills":     pending_bills,
        },
        "dept_stats":    [{"department": r[0], "appointments": r[1]} for r in dept_stats],
        "recent_appointments": [a.to_dict() for a in recent_appts],
    }), 200


@admin_bp.get("/users")
@jwt_required()
def list_users():
    err = require_admin()
    if err: return err
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.put("/users/<int:user_id>/toggle")
@jwt_required()
def toggle_user(user_id):
    err = require_admin()
    if err: return err
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({"message": f"User {'activated' if user.is_active else 'deactivated'}", "user": user.to_dict()}), 200


@admin_bp.get("/audit-log")
@jwt_required()
def audit_log():
    err = require_admin()
    if err: return err
    logs = AuditLog.query.order_by(AuditLog.logged_at.desc()).limit(100).all()
    return jsonify([{
        "log_id":    l.log_id,
        "action":    l.action,
        "table":     l.table_name,
        "record_id": l.record_id,
        "details":   l.details,
        "logged_at": l.logged_at.isoformat(),
    } for l in logs]), 200
