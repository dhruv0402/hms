-- ============================================================
--  MediSync – Hospital Management System
--  Database Schema
--  Created for DBS Lab Mini Project
-- ============================================================

-- Drop and recreate to ensure clean state
DROP DATABASE IF EXISTS medisync;
CREATE DATABASE medisync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medisync;

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
--  DEPARTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    dept_id      INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    description  TEXT,
    floor_no     INT,
    head_name    VARCHAR(100),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
--  USERS  (shared auth table for all roles)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP NULL
);

-- ─────────────────────────────────────────────
--  PATIENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    patient_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    first_name      VARCHAR(60) NOT NULL,
    last_name       VARCHAR(60) NOT NULL,
    dob             DATE,
    gender          ENUM('Male','Female','Other'),
    blood_group     VARCHAR(5),
    phone           VARCHAR(15),
    address         TEXT,
    emergency_contact VARCHAR(15),
    allergies       TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  DOCTORS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    first_name      VARCHAR(60) NOT NULL,
    last_name       VARCHAR(60) NOT NULL,
    dept_id         INT NOT NULL,
    specialization  VARCHAR(150),
    qualification   VARCHAR(200),
    experience_yrs  INT DEFAULT 0,
    phone           VARCHAR(15),
    consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    bio             TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────────
--  AVAILABILITY SLOTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS availability_slots (
    slot_id     INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT NOT NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    max_patients INT DEFAULT 10,
    is_active   BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (doctor_id, day_of_week, start_time)
);

-- ─────────────────────────────────────────────
--  APPOINTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
    appt_id         INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT NOT NULL,
    doctor_id       INT NOT NULL,
    slot_id         INT NOT NULL,
    appt_date       DATE NOT NULL,
    appt_time       TIME NOT NULL,
    status          ENUM('Scheduled','Completed','Cancelled','No-Show') DEFAULT 'Scheduled',
    reason          TEXT,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id)    REFERENCES availability_slots(slot_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  PRESCRIPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    appt_id         INT NOT NULL UNIQUE,
    diagnosis       TEXT NOT NULL,
    notes           TEXT,
    follow_up_date  DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appt_id) REFERENCES appointments(appt_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prescription_medicines (
    med_id          INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_name   VARCHAR(150) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    duration_days   INT,
    instructions    TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  MEDICAL HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_history (
    history_id      INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT NOT NULL,
    condition_name  VARCHAR(200) NOT NULL,
    diagnosed_date  DATE,
    is_chronic      BOOLEAN DEFAULT FALSE,
    treatment       TEXT,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  BILLING
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
    bill_id         INT AUTO_INCREMENT PRIMARY KEY,
    appt_id         INT NOT NULL UNIQUE,
    patient_id      INT NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    medicine_cost   DECIMAL(10,2) DEFAULT 0.00,
    test_cost       DECIMAL(10,2) DEFAULT 0.00,
    other_charges   DECIMAL(10,2) DEFAULT 0.00,
    discount        DECIMAL(10,2) DEFAULT 0.00,
    total_amount    DECIMAL(10,2) GENERATED ALWAYS AS
                    (consultation_fee + medicine_cost + test_cost + other_charges - discount) STORED,
    payment_status  ENUM('Pending','Paid','Refunded','Waived') DEFAULT 'Pending',
    payment_method  ENUM('Cash','Card','UPI','Insurance','Online') DEFAULT 'Cash',
    paid_at         TIMESTAMP NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appt_id)   REFERENCES appointments(appt_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  ADMIN AUDIT LOG
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    action      VARCHAR(100) NOT NULL,
    table_name  VARCHAR(60),
    record_id   INT,
    details     TEXT,
    ip_address  VARCHAR(45),
    logged_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
--  TRIGGERS
-- ─────────────────────────────────────────────

-- Prevent double-booking: same doctor, same date+time
DELIMITER $$
CREATE TRIGGER before_appointment_insert
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;
    SELECT COUNT(*) INTO conflict_count
    FROM appointments
    WHERE doctor_id = NEW.doctor_id
      AND appt_date = NEW.appt_date
      AND appt_time = NEW.appt_time
      AND status NOT IN ('Cancelled', 'No-Show');
    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Scheduling conflict: slot already booked for this doctor.';
    END IF;
END$$

-- Auto-generate bill when appointment is Completed
CREATE TRIGGER after_appointment_complete
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        INSERT IGNORE INTO bills (appt_id, patient_id, consultation_fee)
        SELECT NEW.appt_id, NEW.patient_id, d.consultation_fee
        FROM doctors d WHERE d.doctor_id = NEW.doctor_id;
    END IF;
END$$

-- Audit log trigger for appointments
CREATE TRIGGER audit_appointment_changes
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (action, table_name, record_id, details)
    VALUES ('UPDATE', 'appointments', NEW.appt_id,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
END$$

DELIMITER ;

-- ─────────────────────────────────────────────
--  VIEWS
-- ─────────────────────────────────────────────

-- Full appointment details view
CREATE OR REPLACE VIEW vw_appointment_details AS
SELECT
    a.appt_id,
    a.appt_date,
    a.appt_time,
    a.status,
    a.reason,
    a.notes,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.patient_id,
    p.phone AS patient_phone,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.doctor_id,
    d.specialization,
    dep.name AS department,
    b.total_amount,
    b.payment_status
FROM appointments a
JOIN patients p  ON a.patient_id = p.patient_id
JOIN doctors d   ON a.doctor_id  = d.doctor_id
JOIN departments dep ON d.dept_id = dep.dept_id
LEFT JOIN bills b ON a.appt_id = b.appt_id;

-- Doctor schedule view
CREATE OR REPLACE VIEW vw_doctor_schedule AS
SELECT
    d.doctor_id,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization,
    dep.name AS department,
    d.consultation_fee,
    s.day_of_week,
    s.start_time,
    s.end_time,
    s.max_patients,
    s.slot_id
FROM doctors d
JOIN departments dep ON d.dept_id = dep.dept_id
JOIN availability_slots s ON d.doctor_id = s.doctor_id
WHERE s.is_active = TRUE
ORDER BY d.doctor_id, FIELD(s.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday');

-- Revenue analytics view
CREATE OR REPLACE VIEW vw_revenue_analytics AS
SELECT
    DATE_FORMAT(b.created_at, '%Y-%m') AS month,
    dep.name AS department,
    COUNT(b.bill_id) AS total_bills,
    SUM(b.total_amount) AS gross_revenue,
    SUM(b.discount) AS total_discounts,
    SUM(CASE WHEN b.payment_status = 'Paid' THEN b.total_amount ELSE 0 END) AS collected_revenue,
    SUM(CASE WHEN b.payment_status = 'Pending' THEN b.total_amount ELSE 0 END) AS pending_revenue
FROM bills b
JOIN appointments a ON b.appt_id = a.appt_id
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN departments dep ON d.dept_id = dep.dept_id
GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), dep.name;

-- ─────────────────────────────────────────────
--  STORED PROCEDURES
-- ─────────────────────────────────────────────
DELIMITER $$

-- Book appointment with conflict check
CREATE PROCEDURE sp_book_appointment(
    IN p_patient_id INT,
    IN p_doctor_id  INT,
    IN p_slot_id    INT,
    IN p_date       DATE,
    IN p_time       TIME,
    IN p_reason     TEXT,
    OUT p_appt_id   INT,
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_appt_id = -1;
        SET p_message = 'Booking failed due to scheduling conflict or database error.';
    END;

    START TRANSACTION;
    INSERT INTO appointments (patient_id, doctor_id, slot_id, appt_date, appt_time, reason)
    VALUES (p_patient_id, p_doctor_id, p_slot_id, p_date, p_time, p_reason);
    SET p_appt_id = LAST_INSERT_ID();
    SET p_message = 'Appointment booked successfully.';
    COMMIT;
END$$

-- Dashboard KPIs for admin
CREATE PROCEDURE sp_admin_dashboard_kpis()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM patients) AS total_patients,
        (SELECT COUNT(*) FROM doctors)  AS total_doctors,
        (SELECT COUNT(*) FROM appointments WHERE appt_date = CURDATE()) AS todays_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'Scheduled') AS pending_appointments,
        (SELECT COALESCE(SUM(total_amount),0) FROM bills WHERE payment_status = 'Paid'
            AND MONTH(paid_at) = MONTH(CURDATE()) AND YEAR(paid_at) = YEAR(CURDATE())) AS monthly_revenue,
        (SELECT COUNT(*) FROM bills WHERE payment_status = 'Pending') AS pending_bills;
END$$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
