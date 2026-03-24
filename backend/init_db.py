import sqlite3
import bcrypt

conn = sqlite3.connect("users.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT
)
""")

def add_user(username, password, role):
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    cur.execute(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
        (username, pw_hash.decode(), role)
    )

add_user("principal", "Principal@1152", "principal")
add_user("hod_an", "hod@2023", "an")
add_user("hod_co", "1234", "co")
add_user("hod_ee", "1234", "ee")
add_user("hod_me", "1234", "me")

conn.commit()
conn.close()
print("✅ Users created with bcrypt hashes")
