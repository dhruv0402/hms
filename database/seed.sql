-- ============================================================
--  MediSync – Seed Data
-- ============================================================
USE medisync;

-- ─────────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────────
INSERT INTO departments (name, description, floor_no, head_name) VALUES
('Cardiology',      'Heart and cardiovascular care',         2, 'Dr. Rajesh Sharma'),
('Neurology',       'Brain and nervous system disorders',    3, 'Dr. Priya Nair'),
('Orthopaedics',    'Bones, joints and musculoskeletal',     4, 'Dr. Amit Verma'),
('Paediatrics',     'Healthcare for infants and children',   1, 'Dr. Sunita Reddy'),
('Dermatology',     'Skin, hair and nail conditions',        2, 'Dr. Kavya Menon'),
('General Medicine','Primary care and general health',       1, 'Dr. Rahul Gupta'),
('Gynaecology',     'Women reproductive health',             3, 'Dr. Anita Singh'),
('Oncology',        'Cancer diagnosis and treatment',        5, 'Dr. Vikram Rao');

-- ─────────────────────────────────────────────
-- USERS  (passwords are bcrypt of "Password@123")
-- ─────────────────────────────────────────────
INSERT INTO users (email, password_hash, role) VALUES
-- admin
('admin@medisync.com',          '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'admin'),
-- doctors
('rajesh.sharma@medisync.com',  '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('priya.nair@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('amit.verma@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('sunita.reddy@medisync.com',   '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('rahul.gupta@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
-- patients
('aryan.kapoor@gmail.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'patient'),
('meera.pillai@gmail.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'patient'),
('sanjay.mehta@gmail.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'patient'),
('fatima.khan@gmail.com',       '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'patient'),
('rohan.das@gmail.com',         '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'patient');

-- ─────────────────────────────────────────────
-- DOCTORS
-- ─────────────────────────────────────────────
INSERT INTO doctors (user_id, first_name, last_name, dept_id, specialization, qualification, experience_yrs, phone, consultation_fee, bio) VALUES
(2, 'Rajesh',  'Sharma', 1, 'Interventional Cardiology', 'MBBS, MD (Cardiology), DM', 18, '9876543210', 1200.00, 'Senior cardiologist with expertise in complex interventional procedures.'),
(3, 'Priya',   'Nair',   2, 'Stroke & Epilepsy',         'MBBS, MD (Neurology), DM',  12, '9876543211', 1000.00, 'Specialist in cerebrovascular diseases and epilepsy management.'),
(4, 'Amit',    'Verma',  3, 'Joint Replacement Surgery', 'MBBS, MS (Ortho), DNB',     15, '9876543212', 900.00,  'Expert in knee and hip replacement surgeries with minimally invasive techniques.'),
(5, 'Sunita',  'Reddy',  4, 'Neonatology & Paediatrics', 'MBBS, MD (Paediatrics)',    10, '9876543213', 700.00,  'Dedicated paediatrician focusing on newborn care and childhood development.'),
(6, 'Rahul',   'Gupta',  6, 'Internal Medicine',         'MBBS, MD (General Med)',    8,  '9876543214', 600.00,  'General physician experienced in diagnosing and managing complex multi-system illnesses.');

-- ─────────────────────────────────────────────
-- PATIENTS
-- ─────────────────────────────────────────────
INSERT INTO patients (user_id, first_name, last_name, dob, gender, blood_group, phone, address, emergency_contact, allergies) VALUES
(7,  'Aryan',  'Kapoor', '1990-04-15', 'Male',   'O+',  '9812345670', '45 MG Road, Bengaluru', '9812345671', 'Penicillin'),
(8,  'Meera',  'Pillai', '1985-08-22', 'Female', 'B+',  '9812345672', '12 Indiranagar, Bengaluru', '9812345673', 'None'),
(9,  'Sanjay', 'Mehta',  '1978-12-01', 'Male',   'A+',  '9812345674', '7 Koramangala, Bengaluru', '9812345675', 'Sulfa drugs'),
(10, 'Fatima', 'Khan',   '1995-03-10', 'Female', 'AB-', '9812345676', '33 Whitefield, Bengaluru', '9812345677', 'Latex'),
(11, 'Rohan',  'Das',    '2000-07-28', 'Male',   'O-',  '9812345678', '9 JP Nagar, Bengaluru',   '9812345679', 'None');

-- ─────────────────────────────────────────────
-- AVAILABILITY SLOTS
-- ─────────────────────────────────────────────
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients) VALUES
-- Dr Rajesh Sharma (Cardiology)
(1,'Monday','09:00:00','13:00:00',8),(1,'Wednesday','09:00:00','13:00:00',8),(1,'Friday','14:00:00','18:00:00',8),
-- Dr Priya Nair (Neurology)
(2,'Tuesday','10:00:00','14:00:00',6),(2,'Thursday','10:00:00','14:00:00',6),(2,'Saturday','09:00:00','12:00:00',5),
-- Dr Amit Verma (Orthopaedics)
(3,'Monday','14:00:00','18:00:00',6),(3,'Wednesday','14:00:00','18:00:00',6),(3,'Saturday','10:00:00','13:00:00',5),
-- Dr Sunita Reddy (Paediatrics)
(4,'Monday','09:00:00','17:00:00',10),(4,'Tuesday','09:00:00','17:00:00',10),(4,'Thursday','09:00:00','17:00:00',10),
-- Dr Rahul Gupta (General Med)
(5,'Monday','08:00:00','20:00:00',15),(5,'Tuesday','08:00:00','20:00:00',15),(5,'Wednesday','08:00:00','20:00:00',15),
(5,'Thursday','08:00:00','20:00:00',15),(5,'Friday','08:00:00','20:00:00',15);

-- ─────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────
INSERT INTO appointments (patient_id, doctor_id, slot_id, appt_date, appt_time, status, reason) VALUES
(1, 1, 1, CURDATE() - INTERVAL 10 DAY, '10:00:00', 'Completed', 'Chest pain and breathlessness'),
(2, 2, 4, CURDATE() - INTERVAL 7 DAY,  '11:00:00', 'Completed', 'Recurring headaches and dizziness'),
(3, 5, 13,'2024-01-20',               '09:00:00', 'Completed', 'Fever and body ache'),
(4, 3, 7, CURDATE() + INTERVAL 2 DAY,  '15:00:00', 'Scheduled', 'Knee pain after sports injury'),
(5, 4, 10, CURDATE() + INTERVAL 1 DAY, '10:30:00', 'Scheduled', 'Child vaccination and growth checkup'),
(1, 5, 13, CURDATE() + INTERVAL 3 DAY, '09:00:00', 'Scheduled', 'General health checkup'),
(2, 1, 3,  CURDATE() + INTERVAL 5 DAY, '14:00:00', 'Scheduled', 'Follow-up for cardiac review'),
(3, 2, 6,  CURDATE() - INTERVAL 3 DAY, '10:00:00', 'Cancelled', 'MRI review – cancelled by patient');

-- ─────────────────────────────────────────────
-- PRESCRIPTIONS
-- ─────────────────────────────────────────────
INSERT INTO prescriptions (appt_id, diagnosis, notes, follow_up_date) VALUES
(1, 'Stable Angina – Grade II', 'ECG shows mild ST changes. Lifestyle changes advised. Monitor BP daily.', CURDATE() + INTERVAL 30 DAY),
(2, 'Tension-type headache with mild hypertension', 'MRI brain – normal. Continue physiotherapy.', CURDATE() + INTERVAL 14 DAY),
(3, 'Viral fever with pharyngitis', 'Rest for 3 days. Plenty of fluids.', NULL);

INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, duration_days, instructions) VALUES
(1, 'Aspirin',        '75mg',   'Once daily',  30,  'Take after breakfast'),
(1, 'Atorvastatin',   '20mg',   'Once at night',30, 'Take at bedtime'),
(1, 'Metoprolol',     '25mg',   'Twice daily',  30, 'Take with food'),
(2, 'Paracetamol',    '500mg',  'SOS (as needed)', 5,'Take only when headache starts'),
(2, 'Amitriptyline',  '10mg',   'Once at night', 14,'Low dose for prevention'),
(3, 'Paracetamol',    '650mg',  'Three times daily', 3, 'Take after meals'),
(3, 'Azithromycin',   '500mg',  'Once daily',   5,  'Complete the full course'),
(3, 'ORS',            '1 sachet','4-6 times daily',5,'Mix in 200ml water');

-- ─────────────────────────────────────────────
-- MEDICAL HISTORY
-- ─────────────────────────────────────────────
INSERT INTO medical_history (patient_id, condition_name, diagnosed_date, is_chronic, treatment) VALUES
(1, 'Hypertension',        '2018-06-10', TRUE,  'Amlodipine 5mg daily'),
(1, 'Type 2 Diabetes',     '2020-01-15', TRUE,  'Metformin 500mg twice daily'),
(2, 'Migraine',            '2015-03-22', TRUE,  'Sumatriptan 50mg SOS'),
(3, 'Hypothyroidism',      '2017-09-08', TRUE,  'Levothyroxine 50mcg daily'),
(4, 'Asthma',              '2010-11-30', TRUE,  'Salbutamol inhaler SOS'),
(5, 'Appendicitis (post-op)','2022-04-05',FALSE, 'Appendectomy performed – healed');

-- ─────────────────────────────────────────────
-- BILLS
-- ─────────────────────────────────────────────
INSERT INTO bills (appt_id, patient_id, consultation_fee, medicine_cost, test_cost, other_charges, discount, payment_status, payment_method, paid_at, notes) VALUES
(1, 1, 1200.00, 350.00, 800.00, 0.00, 0.00,   'Paid',    'Card',  NOW() - INTERVAL 9 DAY,  'ECG and blood panel included'),
(2, 2, 1000.00, 180.00, 2500.00,0.00, 250.00, 'Paid',    'UPI',   NOW() - INTERVAL 6 DAY,  'MRI cost covered, discount applied'),
(3, 3, 600.00,  120.00, 0.00,   0.00, 0.00,   'Paid',    'Cash',  NOW() - INTERVAL 2 DAY,  NULL);
