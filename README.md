# 🏥 MediSync – Hospital Appointment & Patient Record Management System

> **DBS Lab Mini Project** | Team: Dhruv Gourisaria · Samarth Bangwal · Jessica Mariam Mathews · Aadi Harnad Bhat

---

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | React 18 + Vite, Tailwind CSS, Recharts       |
| Backend     | Flask 3, Flask-JWT-Extended, Flask-CORS       |
| Database    | MySQL 8 with SQLAlchemy ORM                   |
| Auth        | JWT (access + refresh tokens), bcrypt         |

---

## Project Structure

```
medisync/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── config.py               # Configuration (DB, JWT, CORS)
│   ├── models.py               # SQLAlchemy ORM models
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── auth.py             # Login, register, refresh, /me
│       ├── appointments.py     # Book, list, update, available slots
│       └── other.py            # Patients, doctors, billing, prescriptions, admin
│
├── database/
│   ├── schema.sql              # Tables, triggers, views, stored procedures
│   └── seed.sql                # Demo data (5 doctors, 5 patients, appointments, bills)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             # Router + protected routes
        ├── api/index.js        # Axios client + all API functions
        ├── hooks/useAuth.jsx   # Auth context
        ├── components/
        │   ├── AppLayout.jsx   # Sidebar shell
        │   └── Spinner.jsx     # All shared UI components
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── admin/          # Dashboard, Doctors, Patients, Billing, Users
            ├── doctor/         # Dashboard, Appointments, Patients
            └── patient/        # Dashboard, Appointments, Book, Billing, Profile
```

---

## Setup Instructions

### Prerequisites
- MySQL 8+
- Python 3.10+
- Node.js 18+

---

### 1. Database Setup

```sql
-- In MySQL Workbench or CLI:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD to your MySQL password

# Run
python app.py
# Backend runs at http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## Demo Credentials

All demo accounts use password: **`Password@123`**

| Role    | Email                          |
|---------|--------------------------------|
| Admin   | admin@medisync.com             |
| Doctor  | rajesh.sharma@medisync.com     |
| Patient | aryan.kapoor@gmail.com         |

---

## Features

### Patient
- Register / Login
- Book appointments with doctor + slot selection (3-step wizard)
- View & cancel upcoming appointments
- View prescriptions after completed visits
- View billing history
- Edit profile (personal + medical details)
- Change password

### Doctor
- Today's schedule at a glance
- View all appointments with filter (Scheduled / Completed / etc.)
- Write prescriptions (diagnosis + medicines) → auto-marks appointment Completed
- Mark patients as No-Show
- View patient list

### Admin
- Dashboard with KPIs: patients, doctors, revenue, appointments
- Bar chart: appointments per department
- Add new doctors + assign to departments
- View all patients
- Manage bills (edit amounts, mark Paid/Refunded)
- User management (activate / deactivate accounts)

---

## Database Design Highlights

### Tables (10 total)
`departments` · `users` · `patients` · `doctors` · `availability_slots` · `appointments` · `prescriptions` · `prescription_medicines` · `medical_history` · `bills` · `audit_log`

### Normalization
- **3NF** throughout: no transitive dependencies
- `total_amount` in `bills` is a **generated column** (computed from 5 fields)
- `users` table is shared across all roles (patient / doctor / admin)

### Triggers (3)
1. `before_appointment_insert` – prevents double-booking
2. `after_appointment_complete` – auto-generates bill on completion
3. `audit_appointment_changes` – logs all status changes

### Views (3)
1. `vw_appointment_details` – full appointment info with patient + doctor + bill
2. `vw_doctor_schedule` – doctor availability across days
3. `vw_revenue_analytics` – monthly revenue by department

### Stored Procedures (2)
1. `sp_book_appointment` – transactional booking with conflict handling
2. `sp_admin_dashboard_kpis` – all dashboard metrics in one call

---

## API Endpoints Summary

| Method | Endpoint                          | Description                         |
|--------|-----------------------------------|-------------------------------------|
| POST   | /api/auth/login                   | Login (returns JWT)                 |
| POST   | /api/auth/register                | Register new patient                |
| GET    | /api/auth/me                      | Get current user                    |
| GET    | /api/appointments                 | List appointments (role-filtered)   |
| POST   | /api/appointments                 | Book appointment                    |
| PUT    | /api/appointments/:id             | Update status / notes               |
| GET    | /api/appointments/available-slots | Get free slots for doctor+date      |
| GET    | /api/doctors                      | List doctors (with dept filter)     |
| POST   | /api/doctors                      | Create doctor (admin)               |
| GET    | /api/patients                     | List patients (admin/doctor)        |
| GET    | /api/billing                      | List bills (role-filtered)          |
| PUT    | /api/billing/:id                  | Update bill (admin)                 |
| POST   | /api/prescriptions                | Create prescription (doctor)        |
| GET    | /api/prescriptions/appointment/:id| Get prescription by appointment     |
| GET    | /api/admin/dashboard              | KPIs + recent activity              |
| GET    | /api/admin/users                  | All users                           |
| PUT    | /api/admin/users/:id/toggle       | Activate / deactivate user          |
| GET    | /api/departments                  | List departments                    |

---

## Work Distribution (as assigned)

| Member            | Role                          | What's implemented                              |
|-------------------|-------------------------------|-------------------------------------------------|
| Samarth Bangwal   | Database Architect            | `schema.sql` – all tables, views, triggers, SPs |
| Dhruv Gourisaria  | Backend Developer (Flask)     | `app.py`, `routes/auth.py`, `routes/appointments.py` |
| Aadi Harnad Bhat  | Backend (DB Integration)      | `models.py`, `config.py`, `routes/other.py`    |
| Jessica Mathews   | Frontend & System Ops         | All React pages + components + API client       |
