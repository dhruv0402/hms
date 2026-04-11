#!/usr/bin/env python3
"""
Load realistic demo data into MediSync.
Run AFTER setup_db.py and fix_passwords.py:
  python3 load_rich_data.py
"""
import sys, os, subprocess, getpass

HERE = os.path.dirname(os.path.abspath(__file__))
DB_HOST, DB_PORT, DB_USER, DB_NAME = "localhost", "3306", "root", "medisync"

def get_password():
    env = os.path.join(HERE, "backend", ".env")
    if os.path.exists(env):
        for line in open(env):
            if line.startswith("DB_PASSWORD="):
                return line.strip().split("=",1)[1]
    return getpass.getpass(f"MySQL password for {DB_USER} (Enter for none): ")

def run_sql_file(password, path):
    cmd = ["mysql", f"-u{DB_USER}", f"-h{DB_HOST}", f"-P{DB_PORT}"]
    if password: cmd.append(f"-p{password}")
    with open(path) as f: sql = f.read()
    r = subprocess.run(cmd, input=sql, capture_output=True, text=True)
    return r.returncode, r.stderr

def count(password, table):
    cmd = ["mysql", f"-u{DB_USER}", f"-h{DB_HOST}", f"-P{DB_PORT}", "-se",
           f"SELECT COUNT(*) FROM {table};", DB_NAME]
    if password: cmd.insert(1, f"-p{password}")
    return subprocess.run(cmd, capture_output=True, text=True).stdout.strip()

def main():
    print("=" * 52)
    print("  MediSync – Rich Demo Data Loader")
    print("=" * 52)
    pw = get_password()

    seed = os.path.join(HERE, "database", "seed_rich.sql")
    if not os.path.exists(seed):
        print(f"✗ File not found: {seed}")
        sys.exit(1)

    print("\n→ Loading rich seed data…")
    code, err = run_sql_file(pw, seed)
    if code != 0:
        print(f"✗ Error:\n{err[:500]}")
        sys.exit(1)

    print(f"✓ Done!")
    print(f"\n  Patients     : {count(pw,'patients')}")
    print(f"  Doctors      : {count(pw,'doctors')}")
    print(f"  Appointments : {count(pw,'appointments')}")
    print(f"  Bills        : {count(pw,'bills')}")
    print(f"  Prescriptions: {count(pw,'prescriptions')}")
    print(f"\nRun fix_passwords.py next if not done yet.")

if __name__ == "__main__":
    main()
