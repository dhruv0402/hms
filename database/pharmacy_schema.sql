-- ─────────────────────────────────────────────
--  PHARMACY & INVENTORY
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medicines (
    medicine_id   INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL UNIQUE,
    category      VARCHAR(100), -- Tablet, Syrup, Injection, etc.
    unit_price    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 10, -- For low stock alerts
    manufacturer  VARCHAR(150),
    expiry_date   DATE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id    INT NOT NULL,
    type           ENUM('Purchase', 'Sale', 'Adjustment', 'Expired') NOT NULL,
    quantity       INT NOT NULL,
    description    TEXT,
    performed_by   INT, -- user_id
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Update prescription_medicines to link to medicines table
ALTER TABLE prescription_medicines ADD COLUMN medicine_id INT;
ALTER TABLE prescription_medicines ADD FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE SET NULL;

-- Automatically deduct stock when medicine is "Sold" or "Issued"
-- (Logic will be handled in Backend for better error handling, but we add the structure here)
