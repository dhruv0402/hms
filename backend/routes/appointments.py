from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import date, datetime
from models import db, Appointment, Doctor, Patient, AvailabilitySlot, AuditLog, Bill
from socket_manager import notify_new_appointment, notify_appointment_status

appt_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")

DAY_MAP = {0:"Monday",1:"Tuesday",2:"Wednesday",3:"Thursday",4:"Friday",5:"Saturday",6:"Sunday"}


def _require_role(*roles):
    claims = get_jwt()
    if claims.get("role") not in roles:
        return jsonify({"error": "Forbidden"}), 403
    return None


# ── List appointments ─────────────────────────────────────────────────────────
@appt_bp.get("")
@jwt_required()
def list_appointments():
    claims   = get_jwt()
    identity = get_jwt_identity()
    role     = claims.get("role")

    page     = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status   = request.args.get("status")
    doctor_id= request.args.get("doctor_id", type=int)
    date_from= request.args.get("date_from")
    date_to  = request.args.get("date_to")

    q = Appointment.query

    if role == "patient":
        user = __import__("models").User.query.get(int(identity))
        if not user or not user.patient:
            return jsonify({"error": "Patient profile not found"}), 404
        q = q.filter_by(patient_id=user.patient.patient_id)
    elif role == "doctor":
        user = __import__("models").User.query.get(int(identity))
        if not user or not user.doctor:
            return jsonify({"error": "Doctor profile not found"}), 404
        q = q.filter_by(doctor_id=user.doctor.doctor_id)
    # admin sees all

    if status:
        q = q.filter_by(status=status)
    if doctor_id:
        q = q.filter_by(doctor_id=doctor_id)
    if date_from:
        q = q.filter(Appointment.appt_date >= date_from)
    if date_to:
        q = q.filter(Appointment.appt_date <= date_to)

    q = q.order_by(Appointment.appt_date.desc(), Appointment.appt_time.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "appointments": [a.to_dict() for a in pagination.items],
        "total":        pagination.total,
        "pages":        pagination.pages,
        "current_page": pagination.page,
    }), 200


# ── Get single appointment ────────────────────────────────────────────────────
@appt_bp.get("/<int:appt_id>")
@jwt_required()
def get_appointment(appt_id):
    appt = Appointment.query.get_or_404(appt_id)
    return jsonify(appt.to_dict()), 200


# ── Book appointment ──────────────────────────────────────────────────────────
@appt_bp.post("")
@jwt_required()
def book_appointment():
    claims   = get_jwt()
    identity = get_jwt_identity()
    role     = claims.get("role")

    data = request.get_json()
    required = ["doctor_id", "slot_id", "appt_date", "appt_time"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    # Resolve patient
    if role == "patient":
        from models import User
        user = User.query.get(int(identity))
        if not user or not user.patient:
            return jsonify({"error": "Patient profile not found"}), 404
        patient_id = user.patient.patient_id
    elif role in ("admin", "doctor"):
        patient_id = data.get("patient_id")
        if not patient_id:
            return jsonify({"error": "patient_id required for admin/doctor booking"}), 400
    else:
        return jsonify({"error": "Forbidden"}), 403

    # Validate doctor and slot
    doctor = Doctor.query.get(data["doctor_id"])
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    slot = AvailabilitySlot.query.get(data["slot_id"])
    if not slot or not slot.is_active:
        return jsonify({"error": "Slot not found or inactive"}), 404

    # Verify day matches slot
    try:
        appt_date_obj = datetime.strptime(data["appt_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if appt_date_obj < date.today():
        return jsonify({"error": "Cannot book appointment in the past"}), 400

    day_name = DAY_MAP[appt_date_obj.weekday()]
    if slot.day_of_week != day_name:
        return jsonify({"error": f"Slot is for {slot.day_of_week}, not {day_name}"}), 400

    # Conflict check
    conflict = Appointment.query.filter_by(
        doctor_id = data["doctor_id"],
        appt_date = appt_date_obj,
        appt_time = data["appt_time"],
    ).filter(Appointment.status.notin_(["Cancelled", "No-Show"])).first()

    if conflict:
        return jsonify({"error": "This slot is already booked. Please choose another time."}), 409

    try:
        appt = Appointment(
            patient_id = patient_id,
            doctor_id  = data["doctor_id"],
            slot_id    = data["slot_id"],
            appt_date  = appt_date_obj,
            appt_time  = data["appt_time"],
            reason     = data.get("reason", ""),
        )
        db.session.add(appt)
        db.session.commit()

        # Audit
        log = AuditLog(user_id=int(identity), action="BOOK_APPOINTMENT",
                       table_name="appointments", record_id=appt.appt_id,
                       details=f"Booked with Dr. {doctor.first_name} {doctor.last_name} on {appt_date_obj}")
        db.session.add(log)
        db.session.commit()

        # Phase 3: Notify Doctor
        notify_new_appointment(doctor.user_id, appt.to_dict())

        return jsonify({"message": "Appointment booked successfully", "appointment": appt.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ── Update appointment ────────────────────────────────────────────────────────
@appt_bp.put("/<int:appt_id>")
@jwt_required()
def update_appointment(appt_id):
    claims = get_jwt()
    role   = claims.get("role")
    appt   = Appointment.query.get_or_404(appt_id)
    data   = request.get_json()

    if role == "patient":
        # Patients can only cancel their own
        if data.get("status") not in ("Cancelled",):
            return jsonify({"error": "Patients can only cancel appointments"}), 403
    
    allowed_fields = ["status", "notes", "reason"]
    for field in allowed_fields:
        if field in data:
            setattr(appt, field, data[field])

    try:
        db.session.commit()
        # Auto-generate bill on completion (if not exists)
        if appt.status == "Completed" and not appt.bill:
            bill = Bill(
                appt_id          = appt.appt_id,
                patient_id       = appt.patient_id,
                consultation_fee = appt.doctor.consultation_fee or 0,
            )
            db.session.add(bill)
            db.session.commit()

        # Phase 3: Notify Patient
        from models import Patient as PatientModel
        patient_user_id = appt.patient.user_id
        notify_appointment_status(patient_user_id, appt.to_dict())

        return jsonify({"message": "Appointment updated", "appointment": appt.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ── Today's schedule (for doctors) ───────────────────────────────────────────
@appt_bp.get("/today/schedule")
@jwt_required()
def todays_schedule():
    claims   = get_jwt()
    identity = get_jwt_identity()
    role     = claims.get("role")

    today = date.today()
    q = Appointment.query.filter_by(appt_date=today)

    if role == "doctor":
        from models import User
        user = User.query.get(int(identity))
        if not user or not user.doctor:
            return jsonify({"error": "Doctor profile not found"}), 404
        q = q.filter_by(doctor_id=user.doctor.doctor_id)

    appts = q.order_by(Appointment.appt_time).all()
    return jsonify({"date": str(today), "appointments": [a.to_dict() for a in appts]}), 200


# ── Available slots for a doctor on a date ───────────────────────────────────
@appt_bp.get("/available-slots")
@jwt_required()
def available_slots():
    from datetime import timedelta as td

    doctor_id  = request.args.get("doctor_id", type=int)
    appt_date  = request.args.get("date")

    if not doctor_id or not appt_date:
        return jsonify({"error": "doctor_id and date are required"}), 400

    try:
        date_obj = datetime.strptime(appt_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    day_name = DAY_MAP[date_obj.weekday()]
    slots = AvailabilitySlot.query.filter_by(doctor_id=doctor_id, day_of_week=day_name, is_active=True).all()

    booked_times = {
        str(a.appt_time) for a in Appointment.query.filter_by(
            doctor_id=doctor_id, appt_date=date_obj
        ).filter(Appointment.status.notin_(["Cancelled","No-Show"])).all()
    }

    # Split each availability window into 1-hour sub-slots
    result = []
    for slot in slots:
        # Convert start_time and end_time to minutes since midnight for easy iteration
        start_minutes = slot.start_time.hour * 60 + slot.start_time.minute
        end_minutes   = slot.end_time.hour * 60 + slot.end_time.minute

        current = start_minutes
        while current + 60 <= end_minutes:
            sub_start_h, sub_start_m = divmod(current, 60)
            sub_end_h, sub_end_m     = divmod(current + 60, 60)

            sub_start_str = f"{sub_start_h:02d}:{sub_start_m:02d}:00"
            sub_end_str   = f"{sub_end_h:02d}:{sub_end_m:02d}:00"

            result.append({
                "slot_id":      slot.slot_id,
                "doctor_id":    slot.doctor_id,
                "day_of_week":  slot.day_of_week,
                "start_time":   sub_start_str,
                "end_time":     sub_end_str,
                "max_patients": slot.max_patients,
                "is_active":    slot.is_active,
                "is_booked":    sub_start_str in booked_times,
            })
            current += 60

    return jsonify({"slots": result, "date": appt_date, "day": day_name}), 200
