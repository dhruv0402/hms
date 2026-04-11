-- Seed data for medicines
INSERT INTO medicines (name, category, unit_price, stock_quantity, min_stock_level, manufacturer, expiry_date) VALUES
('Paracetamol 500mg', 'Tablet', 5.50, 500, 50, 'Sun Pharma', '2027-12-31'),
('Amoxicillin 250mg', 'Capsule', 12.00, 200, 30, 'Cipla', '2026-06-15'),
('Cough Syrup (Vicks)', 'Syrup', 85.00, 45, 10, 'P&G', '2028-01-01'),
('Insulin Glargine', 'Injection', 450.00, 15, 5, 'Sanofi', '2025-09-20'),
('Metformin 850mg', 'Tablet', 8.25, 350, 40, 'Dr. Reddy', '2027-03-10'),
('Vitamin C Chewable', 'Tablet', 4.00, 1000, 100, 'Abbott', '2029-05-22'),
('Betadine Ointment', 'Ointment', 65.00, 25, 10, 'GSK', '2026-11-30'),
('Pantoprazole 40mg', 'Tablet', 18.00, 120, 20, 'Alkem', '2027-08-14');
