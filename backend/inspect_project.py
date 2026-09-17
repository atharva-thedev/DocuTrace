import os
import sqlite3
import json

db_paths = ['docutrace.db', '../docutrace.db']
for db_path in db_paths:
    if os.path.exists(db_path):
        print(f"\n=== Database Inspection: {db_path} ===")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print("Tables:", tables)
        for t in tables:
            cursor.execute(f"SELECT count(*) FROM {t}")
            cnt = cursor.fetchone()[0]
            print(f"  {t}: {cnt} records")
            cursor.execute(f"SELECT * FROM {t} LIMIT 2")
            sample = cursor.fetchall()
            print(f"    Sample: {sample}")
        conn.close()
