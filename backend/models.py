from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# ─────────────────────────────────────────────
class Department(db.Model):
    __tablename__ = "departments"
    dept_id     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name        = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    floor_no    = db.Column(db.Integer)
    head_name   = db.Column(db.String(100))
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    doctors = db.relationship("Doctor", backref="department", lazy=True)

    def to_dict(self):
        return {
            "dept_id":     self.dept_id,
            "name":        self.name,
            "description": self.description,
            "floor_no":    self.floor_no,
            "head_name":   self.head_name,
        }

# ─────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"
    user_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email         = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role          = db.Column(db.Enum("patient", "doctor", "admin"), nullable=False, default="patient")
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    last_login    = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "user_id":    self.user_id,
            "email":      self.email,
            "role":       self.role,
            "is_active":  self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

# ─────────────────────────────────────────────
class Patient(db.Model):
    __tablename__ = "patients"
    patient_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id           = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    first_name        = db.Column(db.String(60), nullable=False)
    last_name         = db.Column(db.String(60), nullable=False)
    dob               = db.Column(db.Date)
    gender            = db.Column(db.Enum("Male", "Female", "Other"))
    blood_group       = db.Column(db.String(5))
    phone             = db.Column(db.String(15))
    address           = db.Column(db.Text)
    emergency_contact = db.Column(db.String(15))
    allergies         = db.Column(db.Text)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    user         = db.relationship("User", backref=db.backref("patient", uselist=False))
    appointments = db.relationship("Appointment", backref="patient", lazy=True)
    bills        = db.relationship("Bill", backref="patient", lazy=True)
    history      = db.relationship("MedicalHistory", backref="patient", lazy=True)

    def to_dict(self):
        return {
            "patient_id":        self.patient_id,
            "user_id":           self.user_id,
            "first_name":        self.first_name,
            "last_name":         self.last_name,
            "full_name":         f"{self.first_name} {self.last_name}",
            "dob":               self.dob.isoformat() if self.dob else None,
            "gender":            self.gender,
            "blood_group":       self.blood_group,
            "phone":             self.phone,
            "address":           self.address,
            "emergency_contact": self.emergency_contact,
            "allergies":         self.allergies,
            "email":             self.user.email if self.user else None,
        }

# ─────────────────────────────────────────────
class Doctor(db.Model):
    __tablename__ = "doctors"
    doctor_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id          = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    first_name       = db.Column(db.String(60), nullable=False)
    last_name        = db.Column(db.String(60), nullable=False)
    dept_id          = db.Column(db.Integer, db.ForeignKey("departments.dept_id", ondelete="RESTRICT"), nullable=False)
    specialization   = db.Column(db.String(150))
    qualification    = db.Column(db.String(200))
    experience_yrs   = db.Column(db.Integer, default=0)
    phone            = db.Column(db.String(15))
    consultation_fee = db.Column(db.Numeric(10, 2), default=500.00)
    bio              = db.Column(db.Text)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    user  = db.relationship("User", backref=db.backref("doctor", uselist=False))
    slots = db.relationship("AvailabilitySlot", backref="doctor", lazy=True)

    def to_dict(self):
        return {
            "doctor_id":        self.doctor_id,
            "user_id":          self.user_id,
            "full_name":        f"Dr. {self.first_name} {self.last_name}",
            "first_name":       self.first_name,
            "last_name":        self.last_name,
            "dept_id":          self.dept_id,
            "department":       self.department.name if self.department else None,
            "specialization":   self.specialization,
            "qualification":    self.qualification,
            "experience_yrs":   self.experience_yrs,
            "phone":            self.phone,
            "consultation_fee": float(self.consultation_fee) if self.consultation_fee else 0,
            "bio":              self.bio,
            "email":            self.user.email if self.user else None,
        }

# ─────────────────────────────────────────────
class AvailabilitySlot(db.Model):
    __tablename__ = "availability_slots"
    slot_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    doctor_id    = db.Column(db.Integer, db.ForeignKey("doctors.doctor_id", ondelete="CASCADE"), nullable=False)
    day_of_week  = db.Column(db.Enum("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), nullable=False)
    start_time   = db.Column(db.Time, nullable=False)
    end_time     = db.Column(db.Time, nullable=False)
    max_patients = db.Column(db.Integer, default=10)
    is_active    = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "slot_id":      self.slot_id,
            "doctor_id":    self.doctor_id,
            "day_of_week":  self.day_of_week,
            "start_time":   str(self.start_time),
            "end_time":     str(self.end_time),
            "max_patients": self.max_patients,
            "is_active":    self.is_active,
        }

# ─────────────────────────────────────────────
class Appointment(db.Model):
    __tablename__ = "appointments"
    appt_id    = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    doctor_id  = db.Column(db.Integer, db.ForeignKey("doctors.doctor_id",  ondelete="CASCADE"), nullable=False)
    slot_id    = db.Column(db.Integer, db.ForeignKey("availability_slots.slot_id", ondelete="CASCADE"), nullable=False)
    appt_date  = db.Column(db.Date, nullable=False)
    appt_time  = db.Column(db.Time, nullable=False)
    status     = db.Column(db.Enum("Scheduled","Completed","Cancelled","No-Show"), default="Scheduled")
    reason     = db.Column(db.Text)
    notes      = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    doctor       = db.relationship("Doctor",           backref="appointments", lazy=True)
    slot         = db.relationship("AvailabilitySlot", backref="appointments", lazy=True)
    prescription = db.relationship("Prescription",     backref="appointment",  uselist=False, lazy=True)
    bill         = db.relationship("Bill",             backref="appointment",  uselist=False, lazy=True)

    def to_dict(self):
        return {
            "appt_id":      self.appt_id,
            "patient_id":   self.patient_id,
            "doctor_id":    self.doctor_id,
            "slot_id":      self.slot_id,
            "appt_date":    self.appt_date.isoformat() if self.appt_date else None,
            "appt_time":    str(self.appt_time) if self.appt_time else None,
            "status":       self.status,
            "reason":       self.reason,
            "notes":        self.notes,
            "doctor_name":  f"Dr. {self.doctor.first_name} {self.doctor.last_name}" if self.doctor else None,
            "patient_name": f"{self.patient.first_name} {self.patient.last_name}" if self.patient else None,
            "department":   self.doctor.department.name if self.doctor and self.doctor.department else None,
            "created_at":   self.created_at.isoformat() if self.created_at else None,
        }

# ─────────────────────────────────────────────
class Prescription(db.Model):
    __tablename__ = "prescriptions"
    prescription_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    appt_id         = db.Column(db.Integer, db.ForeignKey("appointments.appt_id", ondelete="CASCADE"), nullable=False, unique=True)
    diagnosis       = db.Column(db.Text, nullable=False)
    notes           = db.Column(db.Text)
    follow_up_date  = db.Column(db.Date)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    medicines = db.relationship("PrescriptionMedicine", backref="prescription", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "prescription_id": self.prescription_id,
            "appt_id":         self.appt_id,
            "diagnosis":       self.diagnosis,
            "notes":           self.notes,
            "follow_up_date":  self.follow_up_date.isoformat() if self.follow_up_date else None,
            "medicines":       [m.to_dict() for m in self.medicines],
            "created_at":      self.created_at.isoformat() if self.created_at else None,
        }

class PrescriptionMedicine(db.Model):
    __tablename__ = "prescription_medicines"
    med_id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prescription_id = db.Column(db.Integer, db.ForeignKey("prescriptions.prescription_id", ondelete="CASCADE"), nullable=False)
    medicine_name   = db.Column(db.String(150), nullable=False)
    dosage          = db.Column(db.String(100))
    frequency       = db.Column(db.String(100))
    duration_days   = db.Column(db.Integer)
    instructions    = db.Column(db.Text)
    medicine_id     = db.Column(db.Integer, db.ForeignKey("medicines.medicine_id", ondelete="SET NULL"), nullable=True)

    medicine = db.relationship("Medicine", backref="prescriptions", lazy=True)

    def to_dict(self):
        return {
            "med_id":        self.med_id,
            "medicine_name": self.medicine_name,
            "medicine_id":   self.medicine_id,
            "dosage":        self.dosage,
            "frequency":     self.frequency,
            "duration_days": self.duration_days,
            "instructions":  self.instructions,
        }

# ─────────────────────────────────────────────
class MedicalHistory(db.Model):
    __tablename__ = "medical_history"
    history_id     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id     = db.Column(db.Integer, db.ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    condition_name = db.Column(db.String(200), nullable=False)
    diagnosed_date = db.Column(db.Date)
    is_chronic     = db.Column(db.Boolean, default=False)
    treatment      = db.Column(db.Text)
    notes          = db.Column(db.Text)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "history_id":     self.history_id,
            "condition_name": self.condition_name,
            "diagnosed_date": self.diagnosed_date.isoformat() if self.diagnosed_date else None,
            "is_chronic":     self.is_chronic,
            "treatment":      self.treatment,
            "notes":          self.notes,
        }

# ─────────────────────────────────────────────
class Bill(db.Model):
    __tablename__ = "bills"
    bill_id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    appt_id          = db.Column(db.Integer, db.ForeignKey("appointments.appt_id", ondelete="CASCADE"), nullable=False, unique=True)
    patient_id       = db.Column(db.Integer, db.ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    consultation_fee = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    medicine_cost    = db.Column(db.Numeric(10, 2), default=0.00)
    test_cost        = db.Column(db.Numeric(10, 2), default=0.00)
    other_charges    = db.Column(db.Numeric(10, 2), default=0.00)
    discount         = db.Column(db.Numeric(10, 2), default=0.00)
    payment_status   = db.Column(db.Enum("Pending","Paid","Refunded","Waived"), default="Pending")
    payment_method   = db.Column(db.Enum("Cash","Card","UPI","Insurance","Online"), default="Cash")
    paid_at          = db.Column(db.DateTime, nullable=True)
    notes            = db.Column(db.Text)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def total_amount(self):
        return float(
            (self.consultation_fee or 0)
            + (self.medicine_cost or 0)
            + (self.test_cost or 0)
            + (self.other_charges or 0)
            - (self.discount or 0)
        )

    def to_dict(self):
        return {
            "bill_id":          self.bill_id,
            "appt_id":          self.appt_id,
            "patient_id":       self.patient_id,
            "consultation_fee": float(self.consultation_fee or 0),
            "medicine_cost":    float(self.medicine_cost or 0),
            "test_cost":        float(self.test_cost or 0),
            "other_charges":    float(self.other_charges or 0),
            "discount":         float(self.discount or 0),
            "total_amount":     self.total_amount,
            "payment_status":   self.payment_status,
            "payment_method":   self.payment_method,
            "paid_at":          self.paid_at.isoformat() if self.paid_at else None,
            "notes":            self.notes,
            "created_at":       self.created_at.isoformat() if self.created_at else None,
        }

# ─────────────────────────────────────────────
class AuditLog(db.Model):
    __tablename__ = "audit_log"
    log_id     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    action     = db.Column(db.String(100), nullable=False)
    table_name = db.Column(db.String(60))
    record_id  = db.Column(db.Integer)
    details    = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    logged_at  = db.Column(db.DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────
class Medicine(db.Model):
    __tablename__ = "medicines"
    medicine_id    = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name           = db.Column(db.String(150), nullable=False, unique=True)
    category       = db.Column(db.String(100))
    unit_price     = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    stock_quantity = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=10)
    manufacturer   = db.Column(db.String(150))
    expiry_date    = db.Column(db.Date)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "medicine_id":    self.medicine_id,
            "name":           self.name,
            "category":       self.category,
            "unit_price":     float(self.unit_price) if self.unit_price else 0,
            "stock_quantity": self.stock_quantity,
            "min_stock_level": self.min_stock_level,
            "manufacturer":   self.manufacturer,
            "expiry_date":    self.expiry_date.isoformat() if self.expiry_date else None,
        }

class InventoryTransaction(db.Model):
    __tablename__ = "inventory_transactions"
    transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    medicine_id    = db.Column(db.Integer, db.ForeignKey("medicines.medicine_id", ondelete="CASCADE"), nullable=False)
    type           = db.Column(db.Enum("Purchase", "Sale", "Adjustment", "Expired"), nullable=False)
    quantity       = db.Column(db.Integer, nullable=False)
    description    = db.Column(db.Text)
    performed_by   = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    medicine = db.relationship("Medicine", backref="transactions", lazy=True)
    user     = db.relationship("User", backref="inventory_actions", lazy=True)

    def to_dict(self):
        return {
            "transaction_id": self.transaction_id,
            "medicine_id":    self.medicine_id,
            "medicine_name":  self.medicine.name if self.medicine else None,
            "type":           self.type,
            "quantity":       self.quantity,
            "performed_by":   self.user.email if self.user else "System",
            "created_at":     self.created_at.isoformat() if self.created_at else None,
        }
