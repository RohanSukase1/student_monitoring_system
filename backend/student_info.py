import sqlite3

def init_student_table():
    conn = sqlite3.connect("students.db")
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS students (
        enrollment TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        year TEXT NOT NULL,
        mobile INTEGER(10) ,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
    print("✅ Students table ready")

init_student_table()
