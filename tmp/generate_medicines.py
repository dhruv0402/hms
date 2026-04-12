import random
from datetime import datetime, timedelta

def generate_medicines(count=500):
    categories = {
        "Analgesic": ["Paracetamol", "Ibuprofen", "Aspirin", "Naproxen", "Tramadol", "Diclofenac"],
        "Antibiotic": ["Amoxicillin", "Azithromycin", "Ciprofloxacin", "Doxycycline", "Cephalexin", "Metronidazole"],
        "Antidiabetic": ["Metformin", "Glipizide", "Sitagliptin", "Insulin", "Jardiance", "Farxiga"],
        "Cardiovascular": ["Atorvastatin", "Lisinopril", "Amlodipine", "Metoprolol", "Losartan", "Rosuvastatin"],
        "Respiratory": ["Albuterol", "Fluticasone", "Montelukast", "Vicks", "Cetirizine", "Loratadine"],
        "Gastrointestinal": ["Omeprazole", "Pantoprazole", "Famotidine", "Ranitidine", "Pepto-Bismol"],
        "Vitamin": ["Vitamin C", "Vitamin D3", "B-Complex", "Zinc Sulfate", "Folic Acid", "Multivitamin"],
        "Antiviral": ["Oseltamivir", "Acyclovir", "Valacyclovir", "Remdesivir"],
        "Nervous System": ["Gabapentin", "Sertraline", "Alprazolam", "Zolpidem", "Fluoxetine"],
        "Dermatological": ["Hydrocortisone", "Clotrimazole", "Mupirocin", "Betadine"]
    }

    manufacturers = ["Sun Pharma", "Cipla", "Abbott", "Pfizer", "GSK", "Dr. Reddy", "Alkem", "AstraZeneca", "Johnson & Johnson", "Sanofi"]
    forms = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Cream", "Drops"]

    medicines = []
    seen_names = set()

    # Base list expansion
    while len(medicines) < count:
        cat = random.choice(list(categories.keys()))
        base_name = random.choice(categories[cat])
        strength = random.choice(["5mg", "10mg", "20mg", "50mg", "100mg", "250mg", "500mg"])
        name = f"{base_name} {strength}"
        
        if name in seen_names:
            # Add a slight variation if duplicate
            name = f"{name} ({random.choice(['XR', 'SR', 'DS', 'Plus', 'Forte'])})"
        
        if name not in seen_names:
            seen_names.add(name)
            
            unit_price = round(random.uniform(5.0, 500.0), 2)
            stock = random.randint(20, 1000)
            min_stock = random.randint(10, 50)
            man = random.choice(manufacturers)
            expiry = (datetime.now() + timedelta(days=random.randint(180, 1000))).strftime("%Y-%m-%d")
            form = random.choice(forms)
            
            medicines.append((name, form, unit_price, stock, min_stock, man, expiry))

    sql = "-- Seed data for 500 medicines\n"
    sql += "INSERT INTO medicines (name, category, unit_price, stock_quantity, min_stock_level, manufacturer, expiry_date) VALUES\n"
    
    values = []
    for m in medicines:
        values.append(f"('{m[0]}', '{m[1]}', {m[2]}, {m[3]}, {m[4]}, '{m[5]}', '{m[6]}')")
    
    sql += ",\n".join(values) + ";"
    return sql

if __name__ == "__main__":
    content = generate_medicines(500)
    with open("/Users/dhruvgourisaria/hms/database/seed_pharmacy.sql", "w") as f:
        f.write(content)
    print("✓ Successfully generated 500 medicines in database/seed_pharmacy.sql")
