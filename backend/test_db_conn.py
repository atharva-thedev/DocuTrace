import sys
from pymongo import MongoClient
from app.core.config import settings

def test_connection():
    uri = settings.MONGODB_URI
    if not uri:
        print("[ERROR] MONGODB_URI is not configured in .env")
        sys.exit(1)

    host_display = uri.split("@")[-1] if "@" in uri else "unknown host"
    print(f"[*] Attempting connection to MongoDB cluster: {host_display}")
    
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=6000)
        # The 'ping' command tests authorization & server connectivity
        ping_res = client.admin.command('ping')
        print(f"[OK] Ping successful! Response: {ping_res}")
        
        databases = client.list_database_names()
        print(f"[OK] Database connection established successfully!")
        print(f"    Available databases: {databases}")
        return True
    except Exception as e:
        print(f"[FAIL] Could not connect to MongoDB Atlas.")
        print(f"       Error Type   : {type(e).__name__}")
        print(f"       Error Message: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
