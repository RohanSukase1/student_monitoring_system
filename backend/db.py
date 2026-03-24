import sqlite3

conn = sqlite3.connect("student_monitoring.db")
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT,
    enrollment TEXT,
    name TEXT,
    department TEXT,
    year TEXT,
    mobile TEXT,
    recognized INTEGER,
    discipline INTEGER,
    id_card INTEGER,
    shirt_tucked INTEGER,
    image_path TEXT
)
""")

conn.commit()
conn.close()
print("✅ Fresh entries table created")
