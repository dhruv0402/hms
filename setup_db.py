#!/usr/bin/env python3
"""
MediSync – Database Setup Script
Uses the mysql CLI directly so DELIMITER / triggers work correctly.
Run: python3 setup_db.py
"""
import sys, os, getpass, subprocess

# ── Config ────────────────────────────────────────────────────
DB_HOST = "localhost"
DB_PORT = "3306"
DB_USER = "root"
DB_NAME = "medisync"
HERE    = os.path.dirname(os.path.abspath(__file__))


def mysql_cmd(password, extra_args=None, database=None):
    """Build mysql CLI command list."""
    cmd = ["mysql", f"-u{DB_USER}", f"-h{DB_HOST}", f"-P{DB_PORT}"]
    if password:
        cmd.append(f"-p{password}")
    if database:
        cmd.append(database)
    if extra_args:
        cmd.extend(extra_args)
    return cmd


def try_connect(password):
    """Return True if mysql can connect with this password."""
    result = subprocess.run(
        mysql_cmd(password, extra_args=["--connect-timeout=5", "-e", "SELECT 1;"]),
        capture_output=True, text=True
    )
    return result.returncode == 0


def run_sql_file(password, filepath, database=None):
    """Run a .sql file through mysql CLI."""
    cmd = mysql_cmd(password, database=database)
    with open(filepath, "r") as f:
        sql = f.read()
    result = subprocess.run(cmd, input=sql, capture_output=True, text=True)
    return result.returncode, result.stderr


def run_sql(password, sql, database=None):
    """Run a raw SQL string through mysql CLI."""
    cmd = mysql_cmd(password, extra_args=["-e", sql], database=database)
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stderr


def get_password():
    # 1. Check existing .env
    env_path = os.path.join(HERE, "backend", ".env")
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("DB_PASSWORD="):
                pw = line.strip().split("=", 1)[1]
                if try_connect(pw):
                    return pw

    # 2. Try no password
    if try_connect(""):
        return ""

    # 3. Prompt
    for _ in range(3):
        pw = getpass.getpass(f"MySQL password for {DB_USER}@{DB_HOST} (Enter for none): ")
        if try_connect(pw):
            return pw
        print("  ✗ Wrong password, try again.")

    print("Could not connect to MySQL. Make sure it's running:")
    print("  brew services start mysql")
    sys.exit(1)


def write_env(password):
    env_path   = os.path.join(HERE, "backend", ".env")
    example    = os.path.join(HERE, "backend", ".env.example")
    if os.path.exists(env_path):
        return  # don't overwrite existing .env
    if os.path.exists(example):
        content = open(example).read()
        content = content.replace("your_mysql_password_here", password)
        open(env_path, "w").write(content)
        print("✓ Created backend/.env")


def main():
    print("=" * 52)
    print("  MediSync – Database Setup")
    print("=" * 52)

    # Check mysql CLI is available
    if subprocess.run(["which", "mysql"], capture_output=True).returncode != 0:
        print("✗ 'mysql' CLI not found. Install MySQL first:")
        print("  brew install mysql")
        sys.exit(1)

    password = get_password()
    print(f"✓ Connected to MySQL as '{DB_USER}'")
    write_env(password)

    # Drop & recreate database
    print(f"\n→ Dropping & recreating database '{DB_NAME}'...")
    run_sql(password, f"DROP DATABASE IF EXISTS `{DB_NAME}`;")
    code, err = run_sql(password, f"CREATE DATABASE `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    if code != 0:
        print(f"✗ Failed to create database: {err}")
        sys.exit(1)
    print(f"✓ Database '{DB_NAME}' created fresh")

    # Run schema — pass database so USE medisync inside schema still works
    schema = os.path.join(HERE, "database", "schema.sql")
    print(f"\n→ Applying schema.sql  (tables, triggers, views, procedures)...")
    code, err = run_sql_file(password, schema)
    if code != 0:
        print(f"✗ Schema error:\n{err}")
        sys.exit(1)
    print(f"✓ Schema applied")

    # Run seed
    seed = os.path.join(HERE, "database", "seed.sql")
    print(f"\n→ Loading seed.sql  (demo data)...")
    code, err = run_sql_file(password, seed)
    if code != 0:
        print(f"✗ Seed error:\n{err}")
        sys.exit(1)
    print(f"✓ Seed data loaded")

    # Verify
    def count(table):
        result = subprocess.run(
            mysql_cmd(password, extra_args=["-se", f"SELECT COUNT(*) FROM {table};"], database=DB_NAME),
            capture_output=True, text=True
        )
        return result.stdout.strip()

    print(f"\n{'='*52}")
    print(f"  ✓  Setup complete!")
    print(f"     Patients     : {count('patients')}")
    print(f"     Doctors      : {count('doctors')}")
    print(f"     Appointments : {count('appointments')}")
    print(f"     Bills        : {count('bills')}")
    print(f"{'='*52}")
    print(f"""
Next steps (open 2 terminals):

  Terminal 1 – Backend:
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python app.py

  Terminal 2 – Frontend:
    cd frontend
    npm install
    npm run dev

  Open: http://localhost:5173
  Login: admin@medisync.com / Password@123
""")

if __name__ == "__main__":
    main()
