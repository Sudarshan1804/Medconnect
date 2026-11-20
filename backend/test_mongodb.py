"""
MongoDB Atlas Connection Diagnostic Utility
Tests connectivity, authentication, and database access to MongoDB Atlas.
"""
import os
import sys
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

def normalize_mongodb_uri(uri):
    if not uri:
        return uri
    uri = uri.strip()
    if "://" in uri:
        scheme, rest = uri.split("://", 1)
        if "@" in rest:
            last_at_idx = rest.rfind("@")
            auth_part = rest[:last_at_idx]
            host_part = rest[last_at_idx + 1 :]
            if ":" in auth_part:
                username, password = auth_part.split(":", 1)
                # If password contains raw '@' or characters that should be escaped
                if "@" in password or ("%" not in password and not password.isalnum()):
                    password = urllib.parse.quote_plus(password)
                return f"{scheme}://{username}:{password}@{host_part}"
    return uri

def test_connection():
    mongodb_uri = normalize_mongodb_uri(os.getenv("MONGODB_URI"))
    db_name = os.getenv("MONGODB_DB_NAME", os.getenv("DB_NAME", "hospital_db"))

    print("=" * 65)
    print("   CityCare Hospital - MongoDB Atlas Diagnostic Utility")
    print("=" * 65)

    if not mongodb_uri or "<username>" in mongodb_uri or "<password>" in mongodb_uri:
        print("[!] ERROR: MONGODB_URI is not configured in backend/.env")
        print("\nPlease update backend/.env with your MongoDB Atlas connection string:")
        print("  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/hospital_db?retryWrites=true&w=majority")
        print("  USE_MONGODB=True")
        return False

    # Mask password for display
    display_uri = mongodb_uri
    if "@" in mongodb_uri and "://" in mongodb_uri:
        prefix, rest = mongodb_uri.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":", 1)[0]
        display_uri = f"{prefix}://{user}:********@{host}"

    print(f"[*] Target URI:      {display_uri}")
    print(f"[*] Target Database: {db_name}")
    print("[*] Initiating connection handshake...")

    try:
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError

        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=8000)
        # Force a network call to verify connectivity
        info = client.admin.command("ping")
        print(f"[✓] SUCCESS: Connected to MongoDB Atlas! Ping response: {info}")

        db = client[db_name]
        collections = db.list_collection_names()
        print(f"[✓] Database '{db_name}' reachable. Existing collections ({len(collections)}):")
        for col in sorted(collections):
            count = db[col].count_documents({})
            print(f"    - {col}: {count} documents")

        print("\n[✓] MongoDB Atlas connection is healthy and ready for Django!")
        print("Next steps:")
        print("  1. Apply migrations: python manage.py migrate")
        print("  2. Seed hospital data: python manage.py seed_data")
        print("  3. Start the server: python manage.py runserver")
        return True

    except ServerSelectionTimeoutError as err:
        print("\n[✗] Connection Timed Out:")
        print("    Could not reach the MongoDB Atlas cluster within 8 seconds.")
        print("\nTroubleshooting Checklist:")
        print("  1. IP Access List: Go to MongoDB Atlas -> Network Access -> Add IP Address.")
        print("     Ensure your current IP (or '0.0.0.0/0' for all IPs during development) is allowed.")
        print("  2. Cluster Status: Check that your Atlas cluster is active and not paused.")
        print(f"    Error details: {err}")
        return False

    except OperationFailure as err:
        print("\n[✗] Authentication Failed:")
        print("    MongoDB Atlas rejected the username or password.")
        print("\nTroubleshooting Checklist:")
        print("  1. Check Database Users: Go to MongoDB Atlas -> Database Access.")
        print("  2. Ensure the user exists and has 'Read and write to any database' permissions.")
        print("  3. Special characters in password: If your password contains '@', ':', or '%', URL-encode them.")
        print(f"    Error details: {err}")
        return False

    except Exception as err:
        print(f"\n[✗] Unexpected Error: {err}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

