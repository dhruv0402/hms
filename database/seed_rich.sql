-- ============================================================
--  MediSync Rich Seed Data  –  realistic demo dataset
-- ============================================================
USE medisync;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE audit_log; TRUNCATE bills; TRUNCATE prescription_medicines;
TRUNCATE prescriptions; TRUNCATE medical_history; TRUNCATE appointments;
TRUNCATE availability_slots; TRUNCATE patients; TRUNCATE doctors;
TRUNCATE users; TRUNCATE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- DEPARTMENTS
INSERT INTO departments (name, description, floor_no, head_name) VALUES
('Cardiology',       'Heart & cardiovascular disease management',        2, 'Dr. Rajesh Sharma'),
('Neurology',        'Brain, spine & nervous system disorders',          3, 'Dr. Priya Nair'),
('Orthopaedics',     'Bones, joints & musculoskeletal surgery',          4, 'Dr. Amit Verma'),
('Paediatrics',      'Infant, child & adolescent healthcare',            1, 'Dr. Sunita Reddy'),
('Dermatology',      'Skin, hair & nail conditions',                     2, 'Dr. Kavya Menon'),
('General Medicine', 'Primary care & internal medicine',                 1, 'Dr. Rahul Gupta'),
('Gynaecology',      'Women\'s reproductive & hormonal health',          3, 'Dr. Anita Singh'),
('Oncology',         'Cancer diagnosis, chemotherapy & palliative care', 5, 'Dr. Vikram Rao'),
('Psychiatry',       'Mental health, anxiety & mood disorders',          4, 'Dr. Meena Iyer'),
('ENT',              'Ear, nose & throat conditions',                    1, 'Dr. Suresh Pillai');

-- USERS (password = pbkdf2:sha256 of "Password@123" — will be fixed by fix_passwords.py)
INSERT INTO users (email, password_hash, role) VALUES
-- admin
('admin@medisync.com',              'PLACEHOLDER', 'admin'),
-- doctors (10)
('rajesh.sharma@medisync.com',      'PLACEHOLDER', 'doctor'),
('priya.nair@medisync.com',         'PLACEHOLDER', 'doctor'),
('amit.verma@medisync.com',         'PLACEHOLDER', 'doctor'),
('sunita.reddy@medisync.com',       'PLACEHOLDER', 'doctor'),
('kavya.menon@medisync.com',        'PLACEHOLDER', 'doctor'),
('rahul.gupta@medisync.com',        'PLACEHOLDER', 'doctor'),
('anita.singh@medisync.com',        'PLACEHOLDER', 'doctor'),
('vikram.rao@medisync.com',         'PLACEHOLDER', 'doctor'),
('meena.iyer@medisync.com',         'PLACEHOLDER', 'doctor'),
('suresh.pillai@medisync.com',      'PLACEHOLDER', 'doctor'),
-- patients (20)
('aryan.kapoor@gmail.com',          'PLACEHOLDER', 'patient'),
('meera.pillai@gmail.com',          'PLACEHOLDER', 'patient'),
('sanjay.mehta@gmail.com',          'PLACEHOLDER', 'patient'),
('fatima.khan@gmail.com',           'PLACEHOLDER', 'patient'),
('rohan.das@gmail.com',             'PLACEHOLDER', 'patient'),
('pooja.sharma@gmail.com',          'PLACEHOLDER', 'patient'),
('kiran.patel@gmail.com',           'PLACEHOLDER', 'patient'),
('deepak.nair@gmail.com',           'PLACEHOLDER', 'patient'),
('lakshmi.iyer@gmail.com',          'PLACEHOLDER', 'patient'),
('rahul.singh@gmail.com',           'PLACEHOLDER', 'patient'),
('anjali.verma@gmail.com',          'PLACEHOLDER', 'patient'),
('suresh.kumar@gmail.com',          'PLACEHOLDER', 'patient'),
('priya.reddy@gmail.com',           'PLACEHOLDER', 'patient'),
('amit.joshi@gmail.com',            'PLACEHOLDER', 'patient'),
('sneha.gupta@gmail.com',           'PLACEHOLDER', 'patient'),
('vikram.malhotra@gmail.com',       'PLACEHOLDER', 'patient'),
('nisha.bose@gmail.com',            'PLACEHOLDER', 'patient'),
('ravi.menon@gmail.com',            'PLACEHOLDER', 'patient'),
('kavita.rao@gmail.com',            'PLACEHOLDER', 'patient'),
('arun.krishna@gmail.com',          'PLACEHOLDER', 'patient');

-- DOCTORS
INSERT INTO doctors (user_id, first_name, last_name, dept_id, specialization, qualification, experience_yrs, phone, consultation_fee, bio) VALUES
(2,  'Rajesh',  'Sharma',  1,  'Interventional Cardiology',      'MBBS, MD, DM (Cardiology)',            18, '9876501001', 1200.00, 'Senior interventional cardiologist with expertise in complex angioplasty and stenting procedures. Former Fellow at AIIMS Delhi.'),
(3,  'Priya',   'Nair',    2,  'Stroke & Epilepsy',              'MBBS, MD (Neurology), DM',             12, '9876501002', 1000.00, 'Specialist in acute stroke management and epilepsy. Published 28 papers in indexed neurology journals.'),
(4,  'Amit',    'Verma',   3,  'Joint Replacement Surgery',      'MBBS, MS (Ortho), DNB, FRCS',         15, '9876501003',  900.00, 'Expert in minimally invasive knee and hip replacement. Over 3,000 successful joint replacement surgeries performed.'),
(5,  'Sunita',  'Reddy',   4,  'Neonatology & Paediatrics',      'MBBS, MD (Paediatrics), Fellowship',   10, '9876501004',  700.00, 'Dedicated neonatologist specialising in premature infant care and childhood developmental disorders.'),
(6,  'Kavya',   'Menon',   5,  'Cosmetic & Clinical Dermatology','MBBS, MD (Dermatology), DVD',           8, '9876501005',  800.00, 'Expert in medical dermatology, laser treatments and cosmetic skin procedures. Certified by IAD.'),
(7,  'Rahul',   'Gupta',   6,  'Internal Medicine',              'MBBS, MD (General Medicine)',           9, '9876501006',  600.00, 'Experienced general physician specialising in diagnosing complex multi-system conditions and preventive care.'),
(8,  'Anita',   'Singh',   7,  'Gynaecology & Obstetrics',       'MBBS, MS (OBG), FRCOG',               14, '9876501007',  950.00, 'Senior gynaecologist with expertise in high-risk pregnancies, laparoscopic surgery and fertility treatments.'),
(9,  'Vikram',  'Rao',     8,  'Medical Oncology',               'MBBS, MD, DM (Oncology)',              16, '9876501008', 1500.00, 'Medical oncologist specialising in breast, lung and colorectal cancers. Pioneer in targeted immunotherapy protocols.'),
(10, 'Meena',   'Iyer',    9,  'Psychiatry & Psychotherapy',     'MBBS, MD (Psychiatry), MRCPsych',      11, '9876501009',  850.00, 'Compassionate psychiatrist focusing on anxiety, depression, OCD and PTSD. Trained in CBT and EMDR therapy.'),
(11, 'Suresh',  'Pillai',  10, 'Otolaryngology (ENT)',           'MBBS, MS (ENT), DORL',                  7, '9876501010',  700.00, 'ENT surgeon with expertise in sinus endoscopy, cochlear implants and micro-ear surgery.');

-- PATIENTS
INSERT INTO patients (user_id, first_name, last_name, dob, gender, blood_group, phone, address, emergency_contact, allergies) VALUES
(12, 'Aryan',    'Kapoor',    '1990-04-15', 'Male',   'O+',  '9812001001', '45 MG Road, Bengaluru 560001',           '9812001002', 'Penicillin'),
(13, 'Meera',    'Pillai',    '1985-08-22', 'Female', 'B+',  '9812001003', '12 Indiranagar, Bengaluru 560038',        '9812001004', 'None'),
(14, 'Sanjay',   'Mehta',     '1978-12-01', 'Male',   'A+',  '9812001005', '7 Koramangala 5th Block, Bengaluru',      '9812001006', 'Sulfa drugs'),
(15, 'Fatima',   'Khan',      '1995-03-10', 'Female', 'AB-', '9812001007', '33 Whitefield Main Rd, Bengaluru 560066', '9812001008', 'Latex, NSAIDs'),
(16, 'Rohan',    'Das',       '2000-07-28', 'Male',   'O-',  '9812001009', '9 JP Nagar 3rd Phase, Bengaluru',         '9812001010', 'None'),
(17, 'Pooja',    'Sharma',    '1992-11-05', 'Female', 'A-',  '9812001011', '22 Jayanagar 4th Block, Bengaluru',       '9812001012', 'Aspirin'),
(18, 'Kiran',    'Patel',     '1988-06-18', 'Male',   'B-',  '9812001013', '67 Malleshwaram, Bengaluru 560003',       '9812001014', 'None'),
(19, 'Deepak',   'Nair',      '1975-09-30', 'Male',   'AB+', '9812001015', '14 Rajajinagar, Bengaluru 560010',        '9812001016', 'Codeine'),
(20, 'Lakshmi',  'Iyer',      '1968-02-14', 'Female', 'O+',  '9812001017', '3 Basavanagudi, Bengaluru 560004',        '9812001018', 'Iodine contrast'),
(21, 'Rahul',    'Singh',     '1995-05-20', 'Male',   'A+',  '9812001019', '88 Electronic City, Bengaluru 560100',    '9812001020', 'None'),
(22, 'Anjali',   'Verma',     '1983-07-11', 'Female', 'B+',  '9812001021', '55 Marathahalli, Bengaluru 560037',       '9812001022', 'Penicillin, Sulfa'),
(23, 'Suresh',   'Kumar',     '1970-10-25', 'Male',   'O+',  '9812001023', '19 Vijayanagar, Bengaluru 560040',        '9812001024', 'None'),
(24, 'Priya',    'Reddy',     '1998-01-08', 'Female', 'AB+', '9812001025', '41 HSR Layout, Bengaluru 560102',         '9812001026', 'None'),
(25, 'Amit',     'Joshi',     '1986-03-22', 'Male',   'A-',  '9812001027', '76 Yelahanka, Bengaluru 560064',          '9812001028', 'Tetracycline'),
(26, 'Sneha',    'Gupta',     '2001-09-14', 'Female', 'O-',  '9812001029', '30 BTM Layout, Bengaluru 560029',         '9812001030', 'None'),
(27, 'Vikram',   'Malhotra',  '1979-12-03', 'Male',   'B+',  '9812001031', '5 Hebbal, Bengaluru 560024',              '9812001032', 'Aspirin, Ibuprofen'),
(28, 'Nisha',    'Bose',      '1991-04-27', 'Female', 'A+',  '9812001033', '62 Sarjapur Road, Bengaluru 560035',      '9812001034', 'None'),
(29, 'Ravi',     'Menon',     '1963-08-15', 'Male',   'O+',  '9812001035', '11 Banashankari, Bengaluru 560070',       '9812001036', 'Morphine'),
(30, 'Kavita',   'Rao',       '1994-06-09', 'Female', 'B-',  '9812001037', '47 Bellandur, Bengaluru 560103',          '9812001038', 'None'),
(31, 'Arun',     'Krishna',   '1987-11-18', 'Male',   'AB-', '9812001039', '28 Kalyan Nagar, Bengaluru 560043',       '9812001040', 'Penicillin');

-- AVAILABILITY SLOTS
INSERT INTO availability_slots (doctor_id, day_of_week, start_time, end_time, max_patients) VALUES
-- Cardiology (Dr Rajesh)
(1,'Monday','09:00:00','13:00:00',8),(1,'Wednesday','09:00:00','13:00:00',8),(1,'Friday','14:00:00','18:00:00',8),
-- Neurology (Dr Priya)
(2,'Tuesday','10:00:00','14:00:00',6),(2,'Thursday','10:00:00','14:00:00',6),(2,'Saturday','09:00:00','12:00:00',5),
-- Ortho (Dr Amit)
(3,'Monday','14:00:00','18:00:00',6),(3,'Wednesday','14:00:00','18:00:00',6),(3,'Saturday','10:00:00','13:00:00',5),
-- Paediatrics (Dr Sunita)
(4,'Monday','09:00:00','17:00:00',12),(4,'Tuesday','09:00:00','17:00:00',12),(4,'Thursday','09:00:00','17:00:00',12),
-- Dermatology (Dr Kavya)
(5,'Tuesday','11:00:00','15:00:00',8),(5,'Friday','10:00:00','14:00:00',8),(5,'Saturday','14:00:00','17:00:00',6),
-- General Medicine (Dr Rahul)
(6,'Monday','08:00:00','20:00:00',20),(6,'Tuesday','08:00:00','20:00:00',20),(6,'Wednesday','08:00:00','20:00:00',20),
(6,'Thursday','08:00:00','20:00:00',20),(6,'Friday','08:00:00','20:00:00',20),
-- Gynaecology (Dr Anita)
(7,'Monday','10:00:00','14:00:00',8),(7,'Wednesday','10:00:00','14:00:00',8),(7,'Friday','10:00:00','14:00:00',8),
-- Oncology (Dr Vikram)
(8,'Tuesday','09:00:00','13:00:00',6),(8,'Thursday','09:00:00','13:00:00',6),
-- Psychiatry (Dr Meena)
(9,'Monday','14:00:00','18:00:00',6),(9,'Wednesday','14:00:00','18:00:00',6),(9,'Saturday','10:00:00','13:00:00',5),
-- ENT (Dr Suresh)
(10,'Tuesday','09:00:00','13:00:00',10),(10,'Thursday','14:00:00','18:00:00',10),(10,'Saturday','09:00:00','12:00:00',8);

-- APPOINTMENTS (mix of past completed, upcoming scheduled, cancelled)
INSERT INTO appointments (patient_id, doctor_id, slot_id, appt_date, appt_time, status, reason) VALUES
-- Completed past appointments
(1,1,1, DATE_SUB(CURDATE(),INTERVAL 45 DAY),'09:00:00','Completed','Chest tightness and exertional breathlessness for 2 weeks'),
(2,2,4, DATE_SUB(CURDATE(),INTERVAL 40 DAY),'10:00:00','Completed','Severe migraines with visual aura, 3 episodes this month'),
(3,3,7, DATE_SUB(CURDATE(),INTERVAL 38 DAY),'14:00:00','Completed','Right knee pain after ACL injury playing cricket'),
(4,5,13,DATE_SUB(CURDATE(),INTERVAL 35 DAY),'11:00:00','Completed','Persistent acne and hyperpigmentation post-pregnancy'),
(5,6,16,DATE_SUB(CURDATE(),INTERVAL 33 DAY),'09:00:00','Completed','Fever 102F, productive cough, fatigue for 5 days'),
(6,7,22,DATE_SUB(CURDATE(),INTERVAL 30 DAY),'10:00:00','Completed','Irregular menstrual cycles and lower abdominal pain'),
(7,1,1, DATE_SUB(CURDATE(),INTERVAL 28 DAY),'10:00:00','Completed','Follow-up after angioplasty – stent check'),
(8,9,25,DATE_SUB(CURDATE(),INTERVAL 25 DAY),'14:00:00','Completed','Anxiety and panic attacks affecting daily work'),
(9,6,16,DATE_SUB(CURDATE(),INTERVAL 22 DAY),'08:00:00','Completed','Thyroid levels review and medication adjustment'),
(10,4,10,DATE_SUB(CURDATE(),INTERVAL 20 DAY),'09:00:00','Completed','Child vaccination – 18-month milestone checkup'),
(11,2,4, DATE_SUB(CURDATE(),INTERVAL 18 DAY),'11:00:00','Completed','Recurring tension headaches and neck stiffness'),
(12,3,7, DATE_SUB(CURDATE(),INTERVAL 15 DAY),'15:00:00','Completed','Lower back pain radiating to left leg – sciatica suspected'),
(13,8,19,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'09:00:00','Completed','Breast lump evaluation – second opinion requested'),
(14,10,28,DATE_SUB(CURDATE(),INTERVAL 10 DAY),'09:00:00','Completed','Chronic sinusitis with nasal polyps'),
(15,6,16,DATE_SUB(CURDATE(),INTERVAL 8 DAY), '10:00:00','Completed','General health checkup – annual physical'),
(16,1,3, DATE_SUB(CURDATE(),INTERVAL 6 DAY), '14:00:00','Completed','Palpitations and dizziness on exertion'),
(17,7,22,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '11:00:00','Completed','Pregnancy follow-up – 28 weeks antenatal visit'),
(18,9,25,DATE_SUB(CURDATE(),INTERVAL 4 DAY), '15:00:00','Completed','Depression screening and medication review'),
(19,2,5, DATE_SUB(CURDATE(),INTERVAL 3 DAY), '10:00:00','Completed','Post-stroke rehabilitation assessment – 3 months'),
(20,5,14,DATE_SUB(CURDATE(),INTERVAL 2 DAY), '11:00:00','Completed','Eczema flare-up – new topical treatment assessment'),
-- Upcoming Scheduled
(1,6,16,DATE_ADD(CURDATE(),INTERVAL 2 DAY), '09:00:00','Scheduled','Diabetes and BP routine follow-up'),
(2,1,2, DATE_ADD(CURDATE(),INTERVAL 3 DAY), '09:00:00','Scheduled','Cardiac stress test review and medication adjustment'),
(3,3,8, DATE_ADD(CURDATE(),INTERVAL 4 DAY), '14:00:00','Scheduled','Post-surgery knee physiotherapy assessment'),
(4,7,23,DATE_ADD(CURDATE(),INTERVAL 5 DAY), '10:00:00','Scheduled','Gynaecology follow-up after laparoscopy'),
(5,10,29,DATE_ADD(CURDATE(),INTERVAL 5 DAY),'09:00:00','Scheduled','Recurrent ear infection and hearing evaluation'),
(6,9,26,DATE_ADD(CURDATE(),INTERVAL 6 DAY), '14:00:00','Scheduled','CBT session for generalised anxiety disorder'),
(7,2,4, DATE_ADD(CURDATE(),INTERVAL 7 DAY), '10:00:00','Scheduled','Epilepsy medication titration – EEG review'),
(8,6,17,DATE_ADD(CURDATE(),INTERVAL 7 DAY), '08:00:00','Scheduled','Hypertension monitoring and lifestyle counselling'),
(9,4,10,DATE_ADD(CURDATE(),INTERVAL 8 DAY), '09:00:00','Scheduled','Child development assessment – speech delay concern'),
(10,8,20,DATE_ADD(CURDATE(),INTERVAL 9 DAY),'09:00:00','Scheduled','Chemotherapy cycle 4 – pre-assessment bloodwork'),
(11,5,13,DATE_ADD(CURDATE(),INTERVAL 10 DAY),'11:00:00','Scheduled','Psoriasis treatment review – biologic therapy'),
(12,1,1, DATE_ADD(CURDATE(),INTERVAL 12 DAY),'09:00:00','Scheduled','First-time cardiology consult – family history of MI'),
(13,8,19,DATE_ADD(CURDATE(),INTERVAL 14 DAY),'09:00:00','Scheduled','Oncology follow-up – biopsy results review'),
-- Cancelled
(14,6,16,DATE_SUB(CURDATE(),INTERVAL 1 DAY),'10:00:00','Cancelled','Cough and cold – patient feeling better'),
(15,3,9, DATE_SUB(CURDATE(),INTERVAL 7 DAY),'10:00:00','Cancelled','Knee pain – could not travel to hospital'),
(16,9,25,DATE_SUB(CURDATE(),INTERVAL 14 DAY),'15:00:00','No-Show','Depression follow-up'),
-- Today
(17,6,16,CURDATE(),'09:00:00','Scheduled','Pregnancy 32-week checkup and blood pressure monitoring'),
(18,1,1, CURDATE(),'10:00:00','Scheduled','Cardiac ECG and cholesterol panel review'),
(19,10,28,CURDATE(),'10:00:00','Scheduled','Tonsillitis recurring episodes evaluation for surgery'),
(20,9,26,CURDATE(),'14:00:00','Scheduled','Bipolar disorder mood stabiliser review');

-- PRESCRIPTIONS (for completed appointments)
INSERT INTO prescriptions (appt_id, diagnosis, notes, follow_up_date) VALUES
(1,  'Stable Angina – CCS Grade II with mild LV dysfunction',        'ECG: ST depression V4-V6. Echo: EF 52%. Start dual antiplatelet. Lifestyle: low-sodium diet, 30min walk daily. Avoid heavy exertion.', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(2,  'Migraine with aura – episodic, moderate-severe intensity',      'MRI brain normal. Triggers: stress, sleep deprivation. Keep headache diary. Avoid bright screens during episodes.', DATE_ADD(CURDATE(), INTERVAL 21 DAY)),
(3,  'ACL Grade II tear – right knee, no surgical intervention needed','MRI confirmed partial ACL tear. Conservative management with physiotherapy. Avoid pivoting sports for 8 weeks.', DATE_ADD(CURDATE(), INTERVAL 42 DAY)),
(4,  'Acne vulgaris Grade III with post-inflammatory hyperpigmentation','Hormonal component likely. Avoid harsh scrubbing. Use SPF 50 daily. Diet: reduce dairy and high-GI foods.', DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
(5,  'Community-acquired pneumonia – mild severity, outpatient management','SpO2 96% on room air. CXR: right lower lobe consolidation. Rest, fluids, complete antibiotic course. Return if breathlessness worsens.', DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
(6,  'Polycystic ovarian syndrome (PCOS) with oligomenorrhoea',       'USG pelvis: polycystic ovaries, follicular cysts. Insulin resistance screen pending. Weight management is key.', DATE_ADD(CURDATE(), INTERVAL 45 DAY)),
(7,  'Post-angioplasty follow-up – stent patent, stable',             'Stress echo: no inducible ischaemia. Continue current medications. No dietary restrictions. Gradual return to full activity.', DATE_ADD(CURDATE(), INTERVAL 90 DAY)),
(8,  'Generalised Anxiety Disorder with panic attacks',               'PHQ-9: 14 (moderate). GAD-7: 16 (severe). Referred for CBT weekly sessions. Sleep hygiene counselling given.', DATE_ADD(CURDATE(), INTERVAL 28 DAY)),
(9,  'Hypothyroidism – TSH elevated at 8.2 mIU/L',                   'Levothyroxine dose increased. Avoid taking with calcium supplements. Morning dose on empty stomach strictly.', DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
(10, 'Well-child visit – 18 months, development on track',            'Weight 11.2kg (50th percentile), Height 82cm (60th percentile). Vaccines administered: MMR, Varicella booster.', NULL),
(11, 'Tension-type headache with cervicogenic component',             'Physiotherapy referral given. Ergonomic workstation assessment recommended. Heat therapy at home.', DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
(12, 'Lumbar disc herniation L4-L5 with left-sided radiculopathy',   'MRI spine: L4-L5 disc herniation, left neural foraminal stenosis. Avoid heavy lifting. Sleep with pillow between knees.', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(13, 'Right breast mass – FNA cytology benign, fibroadenoma',        'Fibroadenoma 1.8cm on USG. Conservative management for now. Monthly self-examination. Yearly mammogram recommended.', DATE_ADD(CURDATE(), INTERVAL 180 DAY)),
(14, 'Chronic rhinosinusitis with nasal polyps – bilateral',          'FESS recommended after failed medical management. Referred to surgical waiting list. Saline nasal rinse twice daily.', DATE_ADD(CURDATE(), INTERVAL 21 DAY)),
(15, 'Annual physical – all parameters within normal limits',         'BMI 24.2 (normal). BP 118/76. FBS 92. Lipid profile normal. Continue current healthy lifestyle. Dental checkup recommended.', DATE_ADD(CURDATE(), INTERVAL 365 DAY)),
(16, 'Paroxysmal atrial fibrillation – first detected',              'Holter monitor 24hr: multiple AF episodes longest 4.2 hours. CHADS-VASc score 1. Started on rate control and anticoagulation.', DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
(17, 'Normal pregnancy – 28 weeks, low risk',                        'Fundal height 28cm. Fetal heart rate 142bpm. GDM screen negative. Iron and folate supplements continue.', DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
(18, 'Major depressive disorder – moderate severity',                 'PHQ-9: 17. Commenced SSRI therapy. Avoid alcohol. Family support is important. Crisis line number given. Review in 4 weeks.', DATE_ADD(CURDATE(), INTERVAL 28 DAY)),
(19, 'Chronic stroke sequelae – left hemiparesis improving',         'Modified Rankin Scale: 2. Motor function improving with rehabilitation. Continue physiotherapy 3x/week. OT assessment done.', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(20, 'Atopic dermatitis – moderate, flare-up triggered by detergent', 'Patch test: positive for formaldehyde (in detergent). Switch to fragrance-free products. Avoid hot water bathing.', DATE_ADD(CURDATE(), INTERVAL 21 DAY));

-- MEDICINES
INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, duration_days, instructions) VALUES
(1,'Aspirin','75mg','Once daily',365,'Take after breakfast'),
(1,'Atorvastatin','40mg','Once at night',365,'Take at bedtime'),
(1,'Metoprolol succinate','25mg','Twice daily',365,'Take with food, do not crush'),
(1,'Ramipril','5mg','Once daily',365,'Check BP weekly'),
(2,'Sumatriptan','50mg','SOS (max 2/day)',10,'Take at headache onset, not for prevention'),
(2,'Amitriptyline','10mg','Once at night',90,'Low dose for migraine prevention'),
(2,'Metoclopramide','10mg','SOS with sumatriptan',10,'For associated nausea'),
(3,'Diclofenac','50mg','Twice daily',14,'Take after meals, avoid in peptic ulcer'),
(3,'Pantoprazole','40mg','Once daily',14,'Take 30 min before food'),
(3,'Calcium + Vit D3','500mg + 250IU','Once daily',60,'Take with food'),
(4,'Adapalene 0.1% gel','Apply pea size','Once at night',90,'Avoid eye area, use sunscreen'),
(4,'Azithromycin','500mg','Once daily',5,'Complete full course'),
(4,'Niacinamide 5% serum','Apply thin layer','Twice daily',90,'Gentle on skin, good for pigmentation'),
(5,'Amoxicillin-Clavulanate','625mg','Twice daily',7,'Take with food to reduce GI side effects'),
(5,'Azithromycin','500mg','Once daily',3,'Atypical cover'),
(5,'Paracetamol','650mg','Three times daily SOS',5,'Only if fever above 100F'),
(5,'ORS sachet','1 sachet in 200ml','As needed',7,'Stay hydrated'),
(6,'Metformin','500mg','Twice daily',90,'Take with food, monitor blood sugar'),
(6,'Inositol','2g','Once daily',90,'Evidence-based for PCOS, take in morning'),
(6,'Folic acid','5mg','Once daily',90,'Continue if planning conception'),
(7,'Aspirin','75mg','Once daily',365,'Continue indefinitely post-stent'),
(7,'Clopidogrel','75mg','Once daily',365,'Do not stop without consulting cardiologist'),
(7,'Rosuvastatin','20mg','Once at night',365,'Target LDL < 70 mg/dL'),
(8,'Escitalopram','10mg','Once daily',90,'Takes 2-4 weeks to show full effect'),
(8,'Clonazepam','0.25mg','SOS for panic attacks',30,'Use sparingly, habit-forming'),
(9,'Levothyroxine','75mcg','Once daily',180,'Take 30 min before breakfast, empty stomach'),
(10,'MMR vaccine','0.5ml IM','Single dose',1,'Watch for fever, apply ice if pain at injection site'),
(10,'Varicella vaccine','0.5ml SC','Single dose',1,'Avoid aspirin for 6 weeks after'),
(11,'Ibuprofen','400mg','Twice daily with food',7,'Avoid long-term use'),
(11,'Muscle relaxant (Methocarbamol)','750mg','Three times daily',5,'May cause drowsiness – avoid driving'),
(12,'Pregabalin','75mg','Twice daily',30,'For radicular pain – taper do not stop abruptly'),
(12,'Methylcobalamin','1500mcg','Once daily',60,'Nerve repair support'),
(12,'Diclofenac gel 1%','Apply locally','Twice daily',30,'Apply to lumbar region only'),
(14,'Mometasone nasal spray','2 puffs each nostril','Once daily',60,'Tilt head slightly forward when using'),
(14,'Cetirizine','10mg','Once at night',30,'For associated allergic component'),
(15,'Vitamin D3','60000 IU','Once weekly',8,'Take with fatty food for absorption'),
(16,'Bisoprolol','2.5mg','Once daily',90,'Rate control for AF'),
(16,'Rivaroxaban','20mg','Once daily with dinner',90,'Anticoagulation – never miss a dose'),
(17,'Ferrous sulphate','200mg','Once daily',90,'Take with vitamin C, not with milk'),
(17,'Folic acid','5mg','Once daily',90,'Continue till 12 weeks postpartum'),
(17,'Calcium carbonate','1g','Twice daily',90,'Take after meals'),
(18,'Sertraline','50mg','Once daily',90,'Take in morning with breakfast'),
(18,'Clonazepam','0.5mg','Once at night SOS',14,'Short-term only for sleep'),
(19,'Aspirin','75mg','Once daily',365,'Long-term stroke prevention'),
(19,'Atorvastatin','40mg','Once at night',365,'Keep LDL < 100 for stroke prevention'),
(19,'Amlodipine','5mg','Once daily',365,'BP target < 130/80 for stroke prevention'),
(20,'Hydrocortisone cream 1%','Apply thin layer','Twice daily',14,'Avoid face, groin and armpits'),
(20,'Cetirizine','10mg','Once at night',21,'For associated itch'),
(20,'Paraffin-based moisturiser','Apply liberally','Three times daily',60,'Apply within 3 mins of bathing');

-- MEDICAL HISTORY
INSERT INTO medical_history (patient_id, condition_name, diagnosed_date, is_chronic, treatment) VALUES
(1,'Hypertension',                '2018-06-10', TRUE,  'Ramipril 5mg, Amlodipine 5mg daily'),
(1,'Type 2 Diabetes Mellitus',    '2020-01-15', TRUE,  'Metformin 500mg twice daily, diet control'),
(1,'Dyslipidaemia',               '2020-01-15', TRUE,  'Atorvastatin 40mg daily'),
(2,'Migraine with aura',          '2015-03-22', TRUE,  'Sumatriptan SOS, Amitriptyline prophylaxis'),
(2,'Depression',                  '2019-07-14', FALSE, 'SSRI – completed 1 year course'),
(3,'ACL injury – right knee',     '2024-01-10', FALSE, 'Conservative – physiotherapy ongoing'),
(3,'Hypertension',                '2019-09-05', TRUE,  'Telmisartan 40mg daily'),
(4,'PCOS',                        '2021-05-20', TRUE,  'Metformin, lifestyle modification'),
(5,'Asthma – mild intermittent',  '2008-11-30', TRUE,  'Salbutamol inhaler SOS'),
(6,'PCOS',                        '2020-08-12', TRUE,  'OCP, Metformin'),
(7,'Coronary artery disease',     '2021-03-18', TRUE,  'Dual antiplatelet, statin, beta-blocker'),
(7,'Hypertension',                '2019-01-10', TRUE,  'Amlodipine 10mg'),
(8,'Generalised Anxiety Disorder','2022-06-05', TRUE,  'Escitalopram, CBT ongoing'),
(9,'Hypothyroidism',              '2017-09-08', TRUE,  'Levothyroxine 75mcg daily'),
(10,'Asthma',                     '2010-11-30', TRUE,  'Montelukast, inhaler as needed'),
(11,'Psoriasis',                  '2016-04-22', TRUE,  'Methotrexate, topical steroids'),
(12,'Hypertension',               '2021-07-14', TRUE,  'Amlodipine 5mg daily'),
(12,'Hyperlipidaemia',            '2021-07-14', TRUE,  'Rosuvastatin 10mg daily'),
(13,'Breast fibroadenoma',        '2024-01-08', FALSE, 'Conservative monitoring'),
(14,'Chronic sinusitis',          '2022-02-28', TRUE,  'Nasal steroids, saline rinse'),
(15,'Iron-deficiency anaemia',    '2023-06-15', FALSE, 'Iron supplementation – resolved'),
(16,'Atrial fibrillation',        '2024-01-16', TRUE,  'Bisoprolol, Rivaroxaban'),
(16,'Hypertension',               '2020-04-12', TRUE,  'Amlodipine, Losartan'),
(17,'G2P1 – current pregnancy',   '2023-09-01', FALSE, 'Antenatal care, iron and folate'),
(18,'Major depressive disorder',  '2024-01-18', TRUE,  'Sertraline 50mg, therapy ongoing'),
(19,'Ischaemic stroke – left MCA','2023-10-05', FALSE, 'Antiplatelet, statin, rehabilitation'),
(19,'Hypertension',               '2018-05-20', TRUE,  'Amlodipine 5mg, Telmisartan 40mg'),
(20,'Atopic dermatitis',          '2019-03-10', TRUE,  'Moisturiser, topical steroids for flares');

-- BILLS (for completed appointments)
INSERT INTO bills (appt_id, patient_id, consultation_fee, medicine_cost, test_cost, other_charges, discount, payment_status, payment_method, paid_at, notes) VALUES
(1,  1,  1200.00, 1850.00, 2400.00, 300.00, 0.00,   'Paid',    'Card',     DATE_SUB(NOW(),INTERVAL 44 DAY), 'ECG, Echo, Troponin panel included'),
(2,  2,  1000.00,  420.00, 3200.00,   0.00, 200.00, 'Paid',    'UPI',      DATE_SUB(NOW(),INTERVAL 39 DAY), 'MRI brain – senior citizen discount applied'),
(3,  3,   900.00,  680.00, 2800.00, 150.00, 0.00,   'Paid',    'Card',     DATE_SUB(NOW(),INTERVAL 37 DAY), 'MRI knee + physiotherapy first session'),
(4,  4,   800.00,  540.00,  600.00,   0.00, 0.00,   'Paid',    'Cash',     DATE_SUB(NOW(),INTERVAL 34 DAY), 'Patch test + skin biopsy'),
(5,  5,   600.00,  380.00,  850.00,   0.00, 0.00,   'Paid',    'UPI',      DATE_SUB(NOW(),INTERVAL 32 DAY), 'CXR + CBC + CRP'),
(6,  6,   950.00,  290.00,  1200.00,  0.00, 100.00, 'Paid',    'Online',   DATE_SUB(NOW(),INTERVAL 29 DAY), 'USG pelvis + hormonal panel – loyalty discount'),
(7,  7,  1200.00,  180.00, 1800.00,   0.00, 0.00,   'Paid',    'Insurance',DATE_SUB(NOW(),INTERVAL 27 DAY), 'Stress echo – insurance covered'),
(8,  8,   850.00,  320.00,  400.00,   0.00, 0.00,   'Paid',    'Cash',     DATE_SUB(NOW(),INTERVAL 24 DAY), 'PHQ-9, GAD-7 administered'),
(9,  9,   600.00,  890.00,  650.00,   0.00, 0.00,   'Paid',    'UPI',      DATE_SUB(NOW(),INTERVAL 21 DAY), 'TSH, T3, T4 + liver function'),
(10,10,   700.00,  120.00,    0.00,   0.00, 0.00,   'Paid',    'Cash',     DATE_SUB(NOW(),INTERVAL 19 DAY), 'Vaccination charges only'),
(11,11,  1000.00,  210.00,  500.00,   0.00, 0.00,   'Paid',    'Card',     DATE_SUB(NOW(),INTERVAL 17 DAY), 'Cervical X-ray + physiotherapy referral'),
(12,12,   900.00,  760.00, 2600.00, 200.00, 0.00,   'Paid',    'Insurance',DATE_SUB(NOW(),INTERVAL 14 DAY), 'MRI lumbar spine – insurance pre-approved'),
(13,13,  1500.00,    0.00,  950.00,   0.00, 0.00,   'Paid',    'Card',     DATE_SUB(NOW(),INTERVAL 11 DAY), 'USG breast + FNA cytology'),
(14,14,   700.00,  480.00,  750.00,   0.00, 0.00,   'Paid',    'UPI',      DATE_SUB(NOW(),INTERVAL 9 DAY),  'CT sinuses + endoscopy'),
(15,15,   600.00,  350.00, 1800.00,   0.00, 0.00,   'Paid',    'Card',     DATE_SUB(NOW(),INTERVAL 7 DAY),  'Full health panel – lipid, sugar, thyroid, CBC'),
(16,16,  1200.00,  920.00,  1100.00,  0.00, 0.00,   'Paid',    'UPI',      DATE_SUB(NOW(),INTERVAL 5 DAY),  'Holter 24hr monitor + echocardiogram'),
(17,17,   950.00,  560.00,  680.00,   0.00, 0.00,   'Paid',    'Cash',     DATE_SUB(NOW(),INTERVAL 4 DAY),  'GDM screen + obstetric Doppler'),
(18,18,   850.00,  420.00,  300.00,   0.00, 0.00,   'Paid',    'UPI',      DATE_SUB(NOW(),INTERVAL 3 DAY),  'PHQ-9 + basic metabolic panel'),
(19,19,  1000.00,  680.00,  900.00, 150.00, 0.00,   'Pending', 'Card',     NULL,                            'MRS assessment + Doppler carotids'),
(20,20,   800.00,  340.00,  420.00,   0.00, 0.00,   'Pending', 'UPI',      NULL,                            'Patch test + skin biopsy');
