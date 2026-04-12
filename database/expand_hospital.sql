-- ============================================================
-- MediSync – Hospital Expansion Script
-- ============================================================
USE medisync;

-- ─────────────────────────────────────────────
-- NEW DEPARTMENTS (12)
-- ─────────────────────────────────────────────
INSERT INTO departments (name, description, floor_no, head_name) VALUES
('ENT',                  'Ear, Nose, and Throat specialists',    2, 'Dr. Samir Bose'),
('Psychiatry',           'Mental health and behavioral sciences', 4, 'Dr. Anjali Desai'),
('Nephrology',           'Kidney disease and dialysis care',      3, 'Dr. Suresh Iyer'),
('Ophthalmology',        'Eye care and vision correction',        2, 'Dr. Preeti Saxena'),
('Gastroenterology',     'Digestive system and liver health',     3, 'Dr. Manoj Tiwari'),
('Pulmonology',          'Respiratory and lung care',             4, 'Dr. Sanjay Kaul'),
('Endocrinology',        'Hormonal and metabolic disorders',      2, 'Dr. Neha Kapoor'),
('Urology',              'Urinary tract and male reproductive',   3, 'Dr. Rakesh Mittal'),
('Rheumatology',         'Autoimmune and joint diseases',         4, 'Dr. Smita Patil'),
('Physical Therapy',     'Rehabilitation and motor recovery',     1, 'Dr. Arjun Malhotra'),
('Dental',               'Oral health and dentistry',             1, 'Dr. Meena Reddy'),
('Hematology',           'Blood-related disorders',               5, 'Dr. Nitin Gadgil');

-- ─────────────────────────────────────────────
-- NEW USERS (Doctors 7-46)
-- Password: "Password@123" ($2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq)
-- ─────────────────────────────────────────────
INSERT INTO users (email, password_hash, role) VALUES
('samir.bose@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('anjali.desai@medisync.com',   '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('suresh.iyer@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('preeti.saxena@medisync.com',  '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('manoj.tiwari@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('sanjay.kaul@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('neha.kapoor@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('rakesh.mittal@medisync.com',   '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('smita.patil@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('arjun.malhotra@medisync.com',  '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('meena.reddy@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('nitin.gadgil@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('sunil.verma@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('alisha.khan@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('vivek.shetty@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('deepa.nair@medisync.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('karthik.raja@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('tanvi.sharma@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('rahul.oberoi@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('sneha.jain@medisync.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('akash.singh@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('pooja.gupta@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('ishaan.malik@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('ridhi.shah@medisync.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('varun.prasad@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('kriti.agarwal@medisync.com',   '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('siddharth.roy@medisync.com',   '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('maya.menon@medisync.com',      '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('dev.chauhan@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('nisha.pandi@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('abhishek.das@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('kiara.advani@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('yash.vardhan@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('tara.sutaria@medisync.com',    '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('karan.johar@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor'),
('zoya.akhtar@medisync.com',     '$2b$12$KIXkZjD8JBF/pG5Z3Rv8IeHc9bJq1VgO3v2l1Q7LdFPcZmA5a6tUq', 'doctor');

-- ─────────────────────────────────────────────
-- NEW DOCTORS
-- ─────────────────────────────────────────────
SET @start_user_id = (SELECT MIN(user_id) FROM users WHERE email='samir.bose@medisync.com');

INSERT INTO doctors (user_id, first_name, last_name, dept_id, specialization, qualification, experience_yrs, phone, consultation_fee, bio) VALUES
(@start_user_id + 0,  'Samir',    'Bose',      9,  'Otology & Rhinology',       'MBBS, MS (ENT)',            14, '9900000001', 800.00,  'Expert in microscopic ear surgery and sinus treatments.'),
(@start_user_id + 1,  'Anjali',   'Desai',    10,  'Clinical Psychology',       'PhD, M.Phil (Psychiatry)',   8,  '9900000002', 1200.00, 'Specialist in Cognitive Behavioral Therapy and mood disorders.'),
(@start_user_id + 2,  'Suresh',   'Iyer',     11,  'Renal Transplantation',     'MBBS, MD, DM (Nephro)',      20, '9900000003', 1500.00, 'Senior nephrologist focusing on chronic kidney disease and transplant.'),
(@start_user_id + 3,  'Preeti',   'Saxena',   12,  'Cataract & Lasik',         'MBBS, MS, Fellowship',       12, '9900000004', 700.00,  'Experienced eye surgeon with thousands of successful cataract procedures.'),
(@start_user_id + 4,  'Manoj',    'Tiwari',   13,  'Hepatology',               'MBBS, MD, DM (Gastro)',      16, '9900000005', 1000.00, 'Expert in liver diseases and advanced endoscopy techniques.'),
(@start_user_id + 5,  'Sanjay',   'Kaul',     14,  'Asthma & COPD',            'MBBS, MD (Chest)',           15, '9900000006', 900.00,  'Dedicated pulmonologist focusing on chronic respiratory conditions.'),
(@start_user_id + 6,  'Neha',     'Kapoor',   15,  'Diabetes & Thyroid',       'MBBS, MD, DM (Endo)',        10, '9900000007', 1100.00, 'Specialist in metabolic disorders and hormonal imbalances.'),
(@start_user_id + 7,  'Rakesh',   'Mittal',   16,  'Kidney Stones & Prostate', 'MBBS, MS, MCh (Urology)',    18, '9900000008', 1300.00, 'Expert in minimally invasive urological surgeries.'),
(@start_user_id + 8,  'Smita',    'Patil',    17,  'Arthritis & Lupus',        'MBBS, MD, DM (Rheum)',       11, '9900000009', 1000.00, 'Focusing on autoimmune diseases and specialized joint care.'),
(@start_user_id + 9,  'Arjun',    'Malhotra', 18,  'Sports Rehab',             'BPT, MPT (Sports)',          9,  '9900000010', 600.00,  'Helping athletes recover from injuries through advanced physiotherapy.'),
(@start_user_id + 10, 'Meena',    'Reddy',    19,  'Cosmetic Dentistry',       'BDS, MDS',                   7,  '9900000011', 500.00,  'Specialist in smile design and oral rehabilitation.'),
(@start_user_id + 11, 'Nitin',    'Gadgil',   20,  'Leukemia & Lymphoma',      'MBBS, MD, DM (Hemato)',      14, '9900000012', 1500.00, 'Onco-hematologist dedicated to blood cancer treatments.'),
(@start_user_id + 12, 'Sunil',    'Verma',     1,  'Cardiac Surgery',          'MBBS, MS, MCh',              22, '9900000013', 1800.00, 'Veteran cardiac surgeon with expertise in bypass and valve replacements.'),
(@start_user_id + 13, 'Alisha',   'Khan',      2,  'Pediatric Neurology',      'MBBS, MD, DM',               10, '9900000014', 1100.00, 'Expert in pediatric nervous system disorders.'),
(@start_user_id + 14, 'Vivek',    'Shetty',    3,  'Spine Surgery',            'MBBS, MS (Ortho)',           17, '9900000015', 1400.00, 'Specialist in complex spine and reconstructive surgeries.'),
(@start_user_id + 15, 'Deepa',    'Nair',      4,  'Developmental Pediatrics', 'MBBS, MD',                   12, '9900000016', 800.00,  'Focusing on child growth and developmental milestones.'),
(@start_user_id + 16, 'Karthik',  'Raja',      5,  'Dermatopathology',         'MBBS, MD (Derm)',            14, '9900000017', 950.00,  'Expert in skin biopsy and complex autoimmune skin conditions.'),
(@start_user_id + 17, 'Tanvi',    'Sharma',    7,  'High-Risk Pregnancy',      'MBBS, MS (Gynae)',           15, '9900000018', 1200.00, 'Dedicated to managing complex and high-risk pregnancies.'),
(@start_user_id + 18, 'Rahul',    'Oberoi',    8,  'Chemotherapy',             'MBBS, MD, DM (Onco)',        13, '9900000019', 1600.00, 'Specialist in medical oncology and targeted therapies.'),
(@start_user_id + 19, 'Sneha',    'Jain',      9,  'Speech Pathology',         'MBBS, MS (ENT)',             11, '9900000020', 850.00,  'Focusing on voice and swallowing disorders.'),
(@start_user_id + 20, 'Akash',    'Singh',    10,  'Child Psychiatry',          'MD (Psychiatry)',            9,  '9900000021', 1300.00, 'Specializing in adolescent mental health.'),
(@start_user_id + 21, 'Pooja',    'Gupta',    11,  'Pediatric Nephrology',      'MD, DM (Nephro)',            10, '9900000022', 1100.00, 'Managing kidney diseases in children.'),
(@start_user_id + 22, 'Ishaan',   'Malik',    12,  'Glaucoma Specialist',      'MS (Ophtho)',                12, '9900000023', 800.00,  'Expert in early detection and treatment of glaucoma.'),
(@start_user_id + 23, 'Ridhi',    'Shah',     13,  'Gastro-Oncology',          'MD, DM (Gastro)',            15, '9900000024', 1200.00, 'Focusing on cancers of the digestive tract.'),
(@start_user_id + 24, 'Varun',    'Prasad',   14,  'Sleep Medicine',            'MD (Pulmonary)',             11, '9900000025', 950.00,  'Specialist in sleep apnea and respiratory failure.'),
(@start_user_id + 25, 'Kriti',    'Agarwal',  15,  'PCOS & Obesity',           'MD, DM (Endo)',              8,  '9900000026', 1000.00, 'Dedicated to metabolic health and hormonal weight management.'),
(@start_user_id + 26, 'Siddharth', 'Roy',     16,  'Kidney Stone Laser',       'MS, MCh (Urology)',          14, '9900000027', 1400.00, 'Expert in RIRS and advanced laser stone removal.'),
(@start_user_id + 27, 'Maya',     'Menon',    17,  'Rheumatoid Arthritis',     'MD, DM (Rheum)',             16, '9900000028', 1150.00, 'Senior rheumatologist with focus on chronic arthritic conditions.'),
(@start_user_id + 28, 'Dev',      'Chauhan',  18,  'Post-Op Rehab',            'MPT (Orthopaedics)',         10, '9900000029', 650.00,  'Specialist in rehabilitation after orthopedic surgeries.'),
(@start_user_id + 29, 'Nisha',    'Pandi',    19,  'Orthodontics',             'MDS (Ortho)',                9,  '9900000030', 900.00,  'Expert in braces and clear aligners.'),
(@start_user_id + 30, 'Abhishek', 'Das',      20,  'Bone Marrow Transplant',   'MD, DM (Hemato)',            18, '9900000031', 2000.00, 'Pioneer in BMT and cellular therapies.'),
(@start_user_id + 31, 'Kiara',    'Advani',    6,  'Preventive Medicine',      'MD (Internal Med)',          7,  '9900000032', 750.00,  'Focusing on healthy lifestyle and disease prevention.'),
(@start_user_id + 32, 'Yash',     'Vardhan',   1,  'Heart Failure Specialist', 'MD, DM (Cardiology)',        12, '9900000033', 1300.00, 'Expert in managing advanced congestive heart failure.'),
(@start_user_id + 33, 'Tara',     'Sutaria',   5,  'Aesthetic Dermatology',    'MD (Dermatology)',           8,  '9900000034', 1500.00, 'Expert in lasers, fillers, and advanced skin rejuvenation.'),
(@start_user_id + 34, 'Karan',    'Johar',     2,  'Neuro-Radiology',          'MD, DM (Neurology)',         11, '9900000035', 1250.00, 'Specialist in imaging and diagnostic neurology.'),
(@start_user_id + 35, 'Zoya',     'Akhtar',    7,  'Fertility Specialist',     'MS (Gynaecology)',           13, '9900000036', 1500.00, 'Helping couples with reproductive health and IVF.');

-- ─────────────────────────────────────────────
-- AVAILABILITY SLOTS (Simplified for all new doctors)
-- ─────────────────────────────────────────────
-- Helper to add slots for all new doctors (6 to 41 internal IDs)
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients)
SELECT d.doctor_id, 'Monday', '09:00:00', '13:00:00', 10 FROM doctors d WHERE d.doctor_id > 5;
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients)
SELECT d.doctor_id, 'Tuesday', '14:00:00', '18:00:00', 10 FROM doctors d WHERE d.doctor_id > 5;
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients)
SELECT d.doctor_id, 'Wednesday', '09:00:00', '13:00:00', 10 FROM doctors d WHERE d.doctor_id > 5;
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients)
SELECT d.doctor_id, 'Thursday', '14:00:00', '18:00:00', 10 FROM doctors d WHERE d.doctor_id > 5;
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients)
SELECT d.doctor_id, 'Friday', '09:00:00', '17:00:00', 15 FROM doctors d WHERE d.doctor_id > 5;
