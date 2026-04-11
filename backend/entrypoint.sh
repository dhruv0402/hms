#!/bin/bash
set -e

echo "⏳ Waiting for MySQL to be ready..."
for i in $(seq 1 30); do
    python -c "
import pymysql
pymysql.connect(host='$DB_HOST', port=int('$DB_PORT'), user='$DB_USER', password='$DB_PASSWORD', database='$DB_NAME')
print('✅ MySQL is ready!')
" 2>/dev/null && break
    echo "  Attempt $i/30 — retrying in 2s..."
    sleep 2
done

echo "🔑 Fixing demo account passwords (bcrypt → pbkdf2)..."
python -c "
import pymysql
from werkzeug.security import generate_password_hash
conn = pymysql.connect(
    host='$DB_HOST', port=int('$DB_PORT'),
    user='$DB_USER', password='$DB_PASSWORD',
    database='$DB_NAME', charset='utf8mb4'
)
cur = conn.cursor()
h = generate_password_hash('Password@123', method='pbkdf2:sha256')
cur.execute('UPDATE users SET password_hash = %s WHERE password_hash NOT LIKE %s', (h, 'pbkdf2:sha256:%'))
affected = cur.rowcount
conn.commit()
cur.close()
conn.close()
print(f'  ✅ Fixed {affected} user passwords')
"

echo "🚀 Starting Flask app..."
exec python app.py
