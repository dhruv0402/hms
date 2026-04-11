#!/usr/bin/env python3
"""
Run this once after setup_db.py to fix the demo account passwords.
python3 fix_passwords.py
"""
import sys, subprocess, getpass
from werkzeug.security import generate_password_hash

try:
    import pymysql
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymysql"], stdout=subprocess.DEVNULL)
    import pymysql

import os

DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_NAME = "medisync"
HERE    = os.path.dirname(os.path.abspath(__file__))

def get_password():
    env = os.path.join(HERE, "backend", ".env")
    if os.path.exists(env):
        for line in open(env):
            if line.startswith("DB_PASSWORD="):
                return line.strip().split("=", 1)[1]
    return getpass.getpass(f"MySQL password for {DB_USER} (Enter for none): ")

def main():
    pw = get_password()
    conn = pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER,
                           password=pw, database=DB_NAME, charset="utf8mb4")
    cur = conn.cursor()

    hash_ = generate_password_hash("Password@123", method="pbkdf2:sha256")

    cur.execute("UPDATE users SET password_hash = %s", (hash_,))
    affected = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    print(f"✓ Updated password for {affected} users → Password@123")
    print()
    print("Demo accounts:")
    print("  admin@medisync.com        /  Password@123")
    print("  rajesh.sharma@medisync.com /  Password@123")
    print("  aryan.kapoor@gmail.com    /  Password@123")

if __name__ == "__main__":
    main()
